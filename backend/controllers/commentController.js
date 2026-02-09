const Comment = require('../models/Comment');
const CommunityPost = require('../models/CommunityPost');

/**
 * Add a comment to a post
 * @route POST /api/community/comments
 */
const addComment = async (req, res) => {
  try {
    const { postId, content, parentCommentId } = req.body;
    const userId = req.user._id;

    if (!postId || !content) {
      return res.status(400).json({ message: 'Post ID and content are required' });
    }

    // Verify post exists
    const post = await CommunityPost.findById(postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // If replying to a comment, verify parent exists
    if (parentCommentId) {
      const parentComment = await Comment.findById(parentCommentId);
      if (!parentComment) {
        return res.status(404).json({ message: 'Parent comment not found' });
      }
    }

    const comment = await Comment.create({
      postId,
      userId,
      content,
      parentCommentId: parentCommentId || null
    });

    const populatedComment = await Comment.findById(comment._id)
      .populate('userId', 'fullName email profilePicture');

    res.status(201).json({
      message: 'Comment added successfully',
      comment: populatedComment
    });
  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({ message: 'Failed to add comment' });
  }
};

/**
 * Get comments for a post
 * @route GET /api/community/comments/:postId
 */
const getComments = async (req, res) => {
  try {
    const { postId } = req.params;
    const { page = 1, limit = 20 } = req.query;

    // Get top-level comments (no parent)
    const comments = await Comment.find({ 
      postId, 
      parentCommentId: null,
      isDeleted: false 
    })
      .populate('userId', 'fullName email profilePicture')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    // Get replies for each comment
    const commentsWithReplies = await Promise.all(
      comments.map(async (comment) => {
        const replies = await Comment.find({
          parentCommentId: comment._id,
          isDeleted: false
        })
          .populate('userId', 'fullName email profilePicture')
          .sort({ createdAt: 1 });

        return {
          ...comment.toObject(),
          replies
        };
      })
    );

    const count = await Comment.countDocuments({ 
      postId, 
      parentCommentId: null,
      isDeleted: false 
    });

    res.json({
      comments: commentsWithReplies,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: count
    });
  } catch (error) {
    console.error('Get comments error:', error);
    res.status(500).json({ message: 'Failed to fetch comments' });
  }
};

/**
 * Delete a comment
 * @route DELETE /api/community/comments/:commentId
 */
const deleteComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const userId = req.user._id;
    const isAdmin = req.user.role === 'admin';

    const query = isAdmin ? { _id: commentId } : { _id: commentId, userId };
    
    const comment = await Comment.findOne(query);
    
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found or unauthorized' });
    }

    // Soft delete
    comment.isDeleted = true;
    await comment.save();

    res.json({ message: 'Comment deleted successfully' });
  } catch (error) {
    console.error('Delete comment error:', error);
    res.status(500).json({ message: 'Failed to delete comment' });
  }
};

/**
 * Like a comment
 * @route POST /api/community/comments/:commentId/like
 */
const likeComment = async (req, res) => {
  try {
    const { commentId } = req.params;

    const comment = await Comment.findById(commentId);
    
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    comment.likes += 1;
    await comment.save();

    res.json({
      message: 'Comment liked successfully',
      likes: comment.likes
    });
  } catch (error) {
    console.error('Like comment error:', error);
    res.status(500).json({ message: 'Failed to like comment' });
  }
};

module.exports = {
  addComment,
  getComments,
  deleteComment,
  likeComment
};
