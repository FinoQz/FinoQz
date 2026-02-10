const CommunityPost = require('../models/CommunityPost');
const Comment = require('../models/Comment');
const Notification = require('../models/Notification');

/**
 * Create a new community post
 * @route POST /api/community/posts
 */
const createPost = async (req, res) => {
  try {
    const { title, content, category, status, isPinned, tags } = req.body;
    const authorId = req.user._id;
    const authorModel = req.user.role === 'admin' || req.user.role === 'moderator' ? 'Admin' : 'User';

    if (!title || !content) {
      return res.status(400).json({ message: 'Title and content are required' });
    }

    const post = await CommunityPost.create({
      title,
      content,
      author: authorId,
      authorModel,
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
    const { title, content, category, status, isPinned, tags, featuredOnLanding } = req.body;

    const isAdmin = req.user.role === 'admin' || req.user.role === 'moderator';
    const query = isAdmin ? { _id: postId } : { _id: postId, author: req.user._id };

    const post = await CommunityPost.findOne(query);
    
    if (!post) {
      return res.status(404).json({ message: 'Post not found or unauthorized' });
    }

    if (title) post.title = title;
    if (content) post.content = content;
    if (category) post.category = category;
    if (status) post.status = status;
    if (typeof isPinned === 'boolean') post.isPinned = isPinned;
    if (typeof featuredOnLanding === 'boolean') post.featuredOnLanding = featuredOnLanding;
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

    const isAdmin = req.user.role === 'admin' || req.user.role === 'moderator';
    const query = isAdmin ? { _id: postId } : { _id: postId, author: req.user._id };

    const post = await CommunityPost.findOneAndDelete(query);
    
    if (!post) {
      return res.status(404).json({ message: 'Post not found or unauthorized' });
    }

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
    const { page = 1, limit = 10, status, category, search, featured } = req.query;

    const query = {};
    if (status) query.status = status;
    if (category) query.category = category;
    if (featured === 'true') query.featuredOnLanding = true;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } }
      ];
    }

    const posts = await CommunityPost.find(query)
      .populate('author', 'fullName email profilePicture')
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
 * Like or unlike a post
 * @route POST /api/community/posts/:postId/like
 */
const likePost = async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user._id;

    const post = await CommunityPost.findById(postId);
    
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const alreadyLiked = post.likes.users.some((u) => u.toString() === userId.toString());
    if (alreadyLiked) {
      post.likes.users = post.likes.users.filter((u) => u.toString() !== userId.toString());
      post.likes.count = Math.max(0, post.likes.count - 1);
    } else {
      post.likes.users.push(userId);
      post.likes.count += 1;

      if (post.authorModel === 'User' && post.author.toString() !== userId.toString()) {
        await Notification.create({
          userId: post.author,
          actorId: userId,
          type: 'like',
          postId: post._id
        });
      }
    }

    await post.save();

    res.json({
      message: 'Post like toggled successfully',
      likes: post.likes.count,
      liked: !alreadyLiked
    });
  } catch (error) {
    console.error('Like post error:', error);
    res.status(500).json({ message: 'Failed to like post' });
  }
};

/**
 * Get users who liked a post
 * @route GET /api/community/posts/:postId/likes
 */
const getPostLikes = async (req, res) => {
  try {
    const { postId } = req.params;

    const post = await CommunityPost.findById(postId)
      .populate('likes.users', 'fullName email profilePicture');

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    res.json({ users: post.likes.users, count: post.likes.count });
  } catch (error) {
    console.error('Get post likes error:', error);
    res.status(500).json({ message: 'Failed to fetch likes' });
  }
};

/**
 * Share a post
 * @route POST /api/community/posts/:postId/share
 */
const sharePost = async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user._id;

    const post = await CommunityPost.findById(postId);
    
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    post.shares += 1;
    await post.save();

    if (post.authorModel === 'User' && post.author.toString() !== userId.toString()) {
      await Notification.create({
        userId: post.author,
        actorId: userId,
        type: 'share',
        postId: post._id
      });
    }

    res.json({ message: 'Post shared', shares: post.shares });
  } catch (error) {
    console.error('Share post error:', error);
    res.status(500).json({ message: 'Failed to share post' });
  }
};

/**
 * Feature/unfeature post on landing
 * @route PATCH /api/community/posts/:postId/feature
 */
const featurePost = async (req, res) => {
  try {
    const { postId } = req.params;

    const post = await CommunityPost.findById(postId);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    post.featuredOnLanding = !post.featuredOnLanding;
    await post.save();

    res.json({ message: 'Feature toggled', featuredOnLanding: post.featuredOnLanding });
  } catch (error) {
    console.error('Feature post error:', error);
    res.status(500).json({ message: 'Failed to feature post' });
  }
};

/**
 * Flag a post
 * @route POST /api/community/posts/:postId/flag
 */
const flagPost = async (req, res) => {
  try {
    const { postId } = req.params;
    const { reason } = req.body;
    const userId = req.user._id;

    const post = await CommunityPost.findById(postId);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    post.flags.push({ userId, reason });
    post.status = 'flagged';
    await post.save();

    res.json({ message: 'Post flagged' });
  } catch (error) {
    console.error('Flag post error:', error);
    res.status(500).json({ message: 'Failed to flag post' });
  }
};

module.exports = {
  createPost,
  updatePost,
  deletePost,
  getPosts,
  getPostById,
  togglePin,
  likePost,
  getPostLikes,
  sharePost,
  featurePost,
  flagPost
};
