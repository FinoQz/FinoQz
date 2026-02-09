const CommunityPost = require('../models/CommunityPost');
const Comment = require('../models/Comment');

/**
 * Create a new community post
 * @route POST /api/community/posts
 */
const createPost = async (req, res) => {
  try {
    const { title, content, category, status, isPinned, tags } = req.body;
    const authorId = req.user._id;

    if (!title || !content) {
      return res.status(400).json({ message: 'Title and content are required' });
    }

    const post = await CommunityPost.create({
      title,
      content,
      author: authorId,
      category: category || 'General',
      status: status || 'draft',
      isPinned: isPinned || false,
      tags: tags || []
    });

    const populatedPost = await CommunityPost.findById(post._id)
      .populate('author', 'fullName email');

    res.status(201).json({
      message: 'Post created successfully',
      post: populatedPost
    });
  } catch (error) {
    console.error('Create post error:', error);
    res.status(500).json({ message: 'Failed to create post' });
  }
};

/**
 * Update a community post
 * @route PUT /api/community/posts/:postId
 */
const updatePost = async (req, res) => {
  try {
    const { postId } = req.params;
    const { title, content, category, status, isPinned, tags } = req.body;
    const authorId = req.user._id;

    const post = await CommunityPost.findOne({ _id: postId, author: authorId });
    
    if (!post) {
      return res.status(404).json({ message: 'Post not found or unauthorized' });
    }

    // Update fields
    if (title) post.title = title;
    if (content) post.content = content;
    if (category) post.category = category;
    if (status) post.status = status;
    if (typeof isPinned === 'boolean') post.isPinned = isPinned;
    if (tags) post.tags = tags;

    await post.save();

    const populatedPost = await CommunityPost.findById(post._id)
      .populate('author', 'fullName email');

    res.json({
      message: 'Post updated successfully',
      post: populatedPost
    });
  } catch (error) {
    console.error('Update post error:', error);
    res.status(500).json({ message: 'Failed to update post' });
  }
};

/**
 * Delete a community post
 * @route DELETE /api/community/posts/:postId
 */
const deletePost = async (req, res) => {
  try {
    const { postId } = req.params;
    const authorId = req.user._id;

    const post = await CommunityPost.findOneAndDelete({ _id: postId, author: authorId });
    
    if (!post) {
      return res.status(404).json({ message: 'Post not found or unauthorized' });
    }

    // Delete all comments associated with this post
    await Comment.deleteMany({ postId });

    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    console.error('Delete post error:', error);
    res.status(500).json({ message: 'Failed to delete post' });
  }
};

/**
 * Get all community posts with filters
 * @route GET /api/community/posts
 */
const getPosts = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, category, search } = req.query;

    const query = {};
    
    if (status) {
      query.status = status;
    }
    
    if (category) {
      query.category = category;
    }
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } }
      ];
    }

    const posts = await CommunityPost.find(query)
      .populate('author', 'fullName email')
      .sort({ isPinned: -1, createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await CommunityPost.countDocuments(query);

    res.json({
      posts,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: count
    });
  } catch (error) {
    console.error('Get posts error:', error);
    res.status(500).json({ message: 'Failed to fetch posts' });
  }
};

/**
 * Get single post by ID
 * @route GET /api/community/posts/:postId
 */
const getPostById = async (req, res) => {
  try {
    const { postId } = req.params;

    const post = await CommunityPost.findById(postId)
      .populate('author', 'fullName email profilePicture');

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Increment views
    post.views += 1;
    await post.save();

    res.json(post);
  } catch (error) {
    console.error('Get post by ID error:', error);
    res.status(500).json({ message: 'Failed to fetch post' });
  }
};

/**
 * Toggle pin status of a post
 * @route PATCH /api/community/posts/:postId/pin
 */
const togglePin = async (req, res) => {
  try {
    const { postId } = req.params;

    const post = await CommunityPost.findById(postId);
    
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    post.isPinned = !post.isPinned;
    await post.save();

    res.json({
      message: `Post ${post.isPinned ? 'pinned' : 'unpinned'} successfully`,
      isPinned: post.isPinned
    });
  } catch (error) {
    console.error('Toggle pin error:', error);
    res.status(500).json({ message: 'Failed to toggle pin' });
  }
};

/**
 * Like a post
 * @route POST /api/community/posts/:postId/like
 */
const likePost = async (req, res) => {
  try {
    const { postId } = req.params;

    const post = await CommunityPost.findById(postId);
    
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    post.likes += 1;
    await post.save();

    res.json({
      message: 'Post liked successfully',
      likes: post.likes
    });
  } catch (error) {
    console.error('Like post error:', error);
    res.status(500).json({ message: 'Failed to like post' });
  }
};

module.exports = {
  createPost,
  updatePost,
  deletePost,
  getPosts,
  getPostById,
  togglePin,
  likePost
};
