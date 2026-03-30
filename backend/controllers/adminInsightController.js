import CommunityInsight from '../models/CommunityInsight.js';
import InsightComment from '../models/InsightComment.js';
import Admin from '../models/Admin.js';

// GET /api/admin/insights - Get all insights with full details
const getAllInsights = async (req, res) => {
  try {
    const { page = 1, limit = 20, filter, search } = req.query;
    
    let query = {};
    
    if (filter === 'pinned') {
      query.isPinned = true;
    } else if (filter === 'active') {
      query.isActive = true;
    } else if (filter === 'inactive') {
      query.isActive = false;
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
    console.error('Get all insights error:', error);
    res.status(500).json({ message: 'Failed to fetch insights' });
  }
};

// GET /api/admin/insights/analytics - Get insights analytics
const getInsightsAnalytics = async (req, res) => {
  try {
    const totalInsights = await CommunityInsight.countDocuments();
    const activeInsights = await CommunityInsight.countDocuments({ isActive: true });
    const pinnedInsights = await CommunityInsight.countDocuments({ isPinned: true });
    
    const totalLikes = await CommunityInsight.aggregate([
      { $group: { _id: null, total: { $sum: '$likeCount' } } }
    ]);
    
    const totalComments = await CommunityInsight.aggregate([
      { $group: { _id: null, total: { $sum: '$commentCount' } } }
    ]);
    
    const totalShares = await CommunityInsight.aggregate([
      { $group: { _id: null, total: { $sum: '$shareCount' } } }
    ]);
    
    const mostEngaged = await CommunityInsight.find({ isActive: true })
      .sort({ likeCount: -1 })
      .limit(5)
      .select('authorName content likeCount commentCount shareCount createdAt')
      .lean();
    
    const topContributors = await CommunityInsight.aggregate([
      { $match: { isActive: true } },
      { $group: { 
        _id: '$authorId', 
        authorName: { $first: '$authorName' },
        postCount: { $sum: 1 },
        totalLikes: { $sum: '$likeCount' },
        totalComments: { $sum: '$commentCount' }
      }},
      { $sort: { postCount: -1 } },
      { $limit: 5 }
    ]);
    
    res.json({
      overview: {
        totalInsights,
        activeInsights,
        pinnedInsights,
        totalLikes: totalLikes[0]?.total || 0,
        totalComments: totalComments[0]?.total || 0,
        totalShares: totalShares[0]?.total || 0
      },
      mostEngaged,
      topContributors
    });
  } catch (error) {
    console.error('Get insights analytics error:', error);
    res.status(500).json({ message: 'Failed to fetch analytics' });
  }
};

// POST /api/admin/insights - Admin creates insight
const createAdminInsight = async (req, res) => {
  try {
    const { content, images, category, tags, isPinned } = req.body;
    
    if (!content || content.trim().length === 0) {
      return res.status(400).json({ message: 'Content is required' });
    }
    
    const adminId = req.adminId || req.user._id || req.user.id;
    const admin = await Admin.findById(adminId).select('fullName email');
    const authorName = admin?.fullName || admin?.email || 'Admin';
    
    const insight = await CommunityInsight.create({
      authorId: adminId,
      authorModel: 'Admin',
      authorName,
      content,
      images: images || [],
      category: category || '',
      tags: tags || [],
      isPinned: isPinned || false
    });
    
    res.status(201).json({
      message: 'Admin insight created successfully',
      insight
    });
  } catch (error) {
    console.error('Create admin insight error:', error);
    res.status(500).json({ message: 'Failed to create insight' });
  }
};

// PATCH /api/admin/insights/:id/pin - Pin/unpin insight
const togglePinInsight = async (req, res) => {
  try {
    const { id } = req.params;
    
    const insight = await CommunityInsight.findById(id);
    if (!insight) {
      return res.status(404).json({ message: 'Insight not found' });
    }
    
    insight.isPinned = !insight.isPinned;
    await insight.save();
    
    res.json({
      message: `Insight ${insight.isPinned ? 'pinned' : 'unpinned'} successfully`,
      insight
    });
  } catch (error) {
    console.error('Toggle pin insight error:', error);
    res.status(500).json({ message: 'Failed to update insight' });
  }
};

// PATCH /api/admin/insights/:id/status - Activate/deactivate insight
const toggleInsightStatus = async (req, res) => {
  try {
    const { id } = req.params;
    
    const insight = await CommunityInsight.findById(id);
    if (!insight) {
      return res.status(404).json({ message: 'Insight not found' });
    }
    
    insight.isActive = !insight.isActive;
    await insight.save();
    
    res.json({
      message: `Insight ${insight.isActive ? 'activated' : 'deactivated'} successfully`,
      insight
    });
  } catch (error) {
    console.error('Toggle insight status error:', error);
    res.status(500).json({ message: 'Failed to update insight' });
  }
};

// DELETE /api/admin/insights/:id - Delete any insight
const deleteAnyInsight = async (req, res) => {
  try {
    const { id } = req.params;
    
    const insight = await CommunityInsight.findByIdAndDelete(id);
    if (!insight) {
      return res.status(404).json({ message: 'Insight not found' });
    }
    
    await InsightComment.deleteMany({ insightId: id });
    
    res.json({ message: 'Insight deleted successfully' });
  } catch (error) {
    console.error('Delete insight error:', error);
    res.status(500).json({ message: 'Failed to delete insight' });
  }
};

export {
  getAllInsights,
  getInsightsAnalytics,
  createAdminInsight,
  togglePinInsight,
  toggleInsightStatus,
  deleteAnyInsight
};
