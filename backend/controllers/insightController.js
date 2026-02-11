const CommunityInsight = require('../models/CommunityInsight');
const InsightComment = require('../models/InsightComment');
const User = require('../models/User');
const Admin = require('../models/Admin');

// GET /api/insights - Get all active insights (paginated)
const getInsights = async (req, res) => {
  try {
    const { page = 1, limit = 10, category, search } = req.query;
    
    let query = { isActive: true };
    
    if (category) {
      query.category = category;
    }
    
    if (search) {
      query.content = { $regex: search, $options: 'i' };
    }
    
    const insights = await CommunityInsight.find(query)
      .sort({ isPinned: -1, createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean();
    
    const count = await CommunityInsight.countDocuments(query);
    
    res.json({
      insights,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page),
      total: count
    });
  } catch (error) {
    console.error('Get insights error:', error);
    res.status(500).json({ message: 'Failed to fetch insights' });
  }
};

// GET /api/insights/:id - Get single insight with comments
const getInsightById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const insight = await CommunityInsight.findById(id).lean();
    if (!insight) {
      return res.status(404).json({ message: 'Insight not found' });
    }
    
    const comments = await InsightComment.find({ insightId: id })
      .sort({ createdAt: -1 })
      .lean();
    
    res.json({ insight, comments });
  } catch (error) {
    console.error('Get insight by ID error:', error);
    res.status(500).json({ message: 'Failed to fetch insight' });
  }
};

// POST /api/insights - Create new insight (authenticated users)
const createInsight = async (req, res) => {
  try {
    const { content, images, category, tags } = req.body;
    
    if (!content || content.trim().length === 0) {
      return res.status(400).json({ message: 'Content is required' });
    }
    
    const userId = req.user._id || req.user.id;
    const userRole = req.user.role || 'user';
    const authorModel = (userRole === 'admin' || userRole === 'moderator') ? 'Admin' : 'User';
    
    // Get author name
    let authorName = 'Anonymous';
    if (authorModel === 'Admin') {
      const admin = await Admin.findById(userId).select('fullName email');
      authorName = admin?.fullName || admin?.email || 'Admin';
    } else {
      const user = await User.findById(userId).select('fullName email');
      authorName = user?.fullName || user?.email || 'User';
    }
    
    const insight = await CommunityInsight.create({
      authorId: userId,
      authorModel,
      authorName,
      content,
      images: images || [],
      category: category || '',
      tags: tags || []
    });
    
    res.status(201).json({
      message: 'Insight created successfully',
      insight
    });
  } catch (error) {
    console.error('Create insight error:', error);
    res.status(500).json({ message: 'Failed to create insight' });
  }
};

// POST /api/insights/:id/like - Like/unlike insight
const likeInsight = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id || req.user.id;
    
    const insight = await CommunityInsight.findById(id);
    if (!insight) {
      return res.status(404).json({ message: 'Insight not found' });
    }
    
    const userIdStr = userId.toString();
    const alreadyLiked = insight.likes.some(likeId => likeId.toString() === userIdStr);
    
    if (alreadyLiked) {
      insight.likes = insight.likes.filter(likeId => likeId.toString() !== userIdStr);
      insight.likeCount = Math.max(0, insight.likeCount - 1);
    } else {
      insight.likes.push(userId);
      insight.likeCount += 1;
    }
    
    await insight.save();
    
    res.json({
      message: alreadyLiked ? 'Like removed' : 'Insight liked',
      liked: !alreadyLiked,
      likeCount: insight.likeCount
    });
  } catch (error) {
    console.error('Like insight error:', error);
    res.status(500).json({ message: 'Failed to like insight' });
  }
};

// POST /api/insights/:id/comment - Add comment to insight
const addComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { commentText } = req.body;
    
    if (!commentText || commentText.trim().length === 0) {
      return res.status(400).json({ message: 'Comment text is required' });
    }
    
    const insight = await CommunityInsight.findById(id);
    if (!insight) {
      return res.status(404).json({ message: 'Insight not found' });
    }
    
    const userId = req.user._id || req.user.id;
    const userRole = req.user.role || 'user';
    const userModel = (userRole === 'admin' || userRole === 'moderator') ? 'Admin' : 'User';
    
    // Get user name
    let userName = 'Anonymous';
    if (userModel === 'Admin') {
      const admin = await Admin.findById(userId).select('fullName email');
      userName = admin?.fullName || admin?.email || 'Admin';
    } else {
      const user = await User.findById(userId).select('fullName email');
      userName = user?.fullName || user?.email || 'User';
    }
    
    const comment = await InsightComment.create({
      insightId: id,
      userId,
      userModel,
      userName,
      commentText
    });
    
    // Update comment count
    insight.commentCount += 1;
    await insight.save();
    
    res.status(201).json({
      message: 'Comment added successfully',
      comment
    });
  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({ message: 'Failed to add comment' });
  }
};

// POST /api/insights/:id/share - Increment share count
const shareInsight = async (req, res) => {
  try {
    const { id } = req.params;
    
    const insight = await CommunityInsight.findById(id);
    if (!insight) {
      return res.status(404).json({ message: 'Insight not found' });
    }
    
    insight.shareCount += 1;
    await insight.save();
    
    res.json({
      message: 'Share count updated',
      shareCount: insight.shareCount
    });
  } catch (error) {
    console.error('Share insight error:', error);
    res.status(500).json({ message: 'Failed to share insight' });
  }
};

// POST /api/insights/comments/:commentId/like - Like/unlike comment
const likeComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const userId = req.user._id || req.user.id;
    
    const comment = await InsightComment.findById(commentId);
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }
    
    const userIdStr = userId.toString();
    const alreadyLiked = comment.likes.some(likeId => likeId.toString() === userIdStr);
    
    if (alreadyLiked) {
      comment.likes = comment.likes.filter(likeId => likeId.toString() !== userIdStr);
      comment.likeCount = Math.max(0, comment.likeCount - 1);
    } else {
      comment.likes.push(userId);
      comment.likeCount += 1;
    }
    
    await comment.save();
    
    res.json({
      message: alreadyLiked ? 'Like removed' : 'Comment liked',
      liked: !alreadyLiked,
      likeCount: comment.likeCount
    });
  } catch (error) {
    console.error('Like comment error:', error);
    res.status(500).json({ message: 'Failed to like comment' });
  }
};

// DELETE /api/insights/:id - Delete own insight (author only)
const deleteInsight = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id || req.user.id;
    const userRole = req.user.role || 'user';
    
    const insight = await CommunityInsight.findById(id);
    if (!insight) {
      return res.status(404).json({ message: 'Insight not found' });
    }
    
    // Check if user is author or admin
    const isAuthor = insight.authorId.toString() === userId.toString();
    const isAdmin = userRole === 'admin' || userRole === 'moderator';
    
    if (!isAuthor && !isAdmin) {
      return res.status(403).json({ message: 'Unauthorized to delete this insight' });
    }
    
    await CommunityInsight.findByIdAndDelete(id);
    await InsightComment.deleteMany({ insightId: id });
    
    res.json({ message: 'Insight deleted successfully' });
  } catch (error) {
    console.error('Delete insight error:', error);
    res.status(500).json({ message: 'Failed to delete insight' });
  }
};

// GET /api/insights/pinned - Get pinned insights for landing page
const getPinnedInsights = async (req, res) => {
  try {
    const insights = await CommunityInsight.find({ 
      isPinned: true, 
      isActive: true 
    })
      .sort({ createdAt: -1 })
      .limit(6)
      .lean();
    
    res.json({ insights });
  } catch (error) {
    console.error('Get pinned insights error:', error);
    res.status(500).json({ message: 'Failed to fetch pinned insights' });
  }
};

module.exports = {
  getInsights,
  getInsightById,
  createInsight,
  likeInsight,
  addComment,
  shareInsight,
  likeComment,
  deleteInsight,
  getPinnedInsights
};
