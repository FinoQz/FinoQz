import FinanceContent from '../models/FinanceContent.js';
import FinanceCategory from '../models/FinanceCategory.js';
import FinanceSubcategory from '../models/FinanceSubcategory.js';
import FinanceEngagement from '../models/FinanceEngagement.js';
import Admin from '../models/Admin.js';
import User from '../models/User.js';
import axios from 'axios';

// --- Utility: YouTube Metadata Fetching ---
export const getYouTubeMetadata = async (req, res) => {
  try {
    const { url } = req.query;
    if (!url) return res.status(400).json({ message: 'URL is required' });

    // Simple extraction of video ID
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    const videoId = (match && match[2].length === 11) ? match[2] : null;

    if (!videoId) return res.status(400).json({ message: 'Invalid YouTube URL' });

    // Fetch from oembed for basic meta (doesn't require API key)
    const oembedUrl = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`;
    const response = await axios.get(oembedUrl);
    
    res.json({
      title: response.data.title,
      thumbnail: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
      authorName: response.data.author_name,
      videoId
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching YouTube metadata', error: error.message });
  }
};

// --- Engagement Controllers ---

export const getEngagement = async (req, res) => {
  try {
    const { id } = req.params;
    const discussions = await FinanceEngagement.find({ resourceId: id, parentId: null })
      .sort({ createdAt: -1 })
      .populate({
        path: 'parentId', // For replies (nested population can be added if needed)
      })
      .lean();
    
    // Fetch replies for each
    const discussionsWithReplies = await Promise.all(discussions.map(async (d) => {
      const replies = await FinanceEngagement.find({ parentId: d._id }).sort({ createdAt: 1 }).lean();
      return { ...d, replies };
    }));

    res.json(discussionsWithReplies);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching discussions', error: error.message });
  }
};

export const addEngagement = async (req, res) => {
  try {
    const { id } = req.params;
    const { text, parentId } = req.body;

    // req.user only has {id, role, fingerprint} from JWT — must fetch from DB for name
    const userId = req.user?.id || req.user?._id;
    const dbUser = await User.findById(userId).select('fullName email profilePicture').lean();

    // fullName is required on User model, so this should always be set
    const displayName = dbUser?.fullName || dbUser?.email?.split('@')[0] || 'Anonymous User';
    const userAvatar = dbUser?.profilePicture || '';

    const engagement = await FinanceEngagement.create({
      resourceId: id,
      userId,
      userName: displayName,
      userAvatar,
      text,
      parentId: parentId || null
    });

    res.status(201).json(engagement);
  } catch (error) {
    res.status(400).json({ message: 'Error posting engagement', error: error.message });
  }
};

export const likeEngagement = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id || req.user?._id;

    const engagement = await FinanceEngagement.findById(id);
    if (!engagement) return res.status(404).json({ message: 'Comment not found' });

    const alreadyLiked = engagement.likes.some(l => l.toString() === userId.toString());
    if (alreadyLiked) {
      engagement.likes = engagement.likes.filter(l => l.toString() !== userId.toString());
    } else {
      engagement.likes.push(userId);
    }
    await engagement.save();
    res.json({ likes: engagement.likes.length, liked: !alreadyLiked });
  } catch (error) {
    res.status(500).json({ message: 'Error liking comment', error: error.message });
  }
};

export const deleteEngagement = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id || req.user?._id;

    const engagement = await FinanceEngagement.findById(id);
    if (!engagement) return res.status(404).json({ message: 'Comment not found' });

    // Allow user to delete their own comment
    if (engagement.userId.toString() !== userId.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this comment' });
    }

    await FinanceEngagement.findByIdAndDelete(id);
    res.json({ message: 'Comment deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting comment', error: error.message });
  }
};

export const adminDeleteEngagement = async (req, res) => {
  try {
    const { id } = req.params;
    await FinanceEngagement.findByIdAndDelete(id);
    res.json({ message: 'Comment deleted by admin' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting comment', error: error.message });
  }
};

export const adminGetAllDiscussions = async (req, res) => {
  try {
    const { resourceId, page = 1, limit = 30 } = req.query;
    let query = { parentId: null };
    if (resourceId) query.resourceId = resourceId;

    const discussions = await FinanceEngagement.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .populate('resourceId', 'title')
      .lean();

    const total = await FinanceEngagement.countDocuments(query);

    // Attach replies
    const withReplies = await Promise.all(discussions.map(async (d) => {
      const replies = await FinanceEngagement.find({ parentId: d._id }).sort({ createdAt: 1 }).lean();
      return { ...d, replies };
    }));

    res.json({ discussions: withReplies, total });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching discussions', error: error.message });
  }
};

// --- Analytics Controllers ---

export const getContentAnalytics = async (req, res) => {
  try {
    // 1. Total Stats
    const totalViews = await FinanceContent.aggregate([
      { $group: { _id: null, total: { $sum: '$analytics.views' } } }
    ]);
    const totalEngagement = await FinanceEngagement.countDocuments();

    // 2. Most Active Topics (by engagement density in last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const activeTopics = await FinanceEngagement.aggregate([
      { $match: { createdAt: { $gte: thirtyDaysAgo } } },
      { $group: { _id: '$resourceId', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'financecontents', // ensure this matches collection name
          localField: '_id',
          foreignField: '_id',
          as: 'content'
        }
      },
      { $unwind: '$content' }
    ]);

    res.json({
      totalViews: totalViews[0]?.total || 0,
      totalEngagement,
      activeTopics: activeTopics.map(t => ({
        id: t._id,
        title: t.content.title,
        count: t.count
      }))
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching analytics', error: error.message });
  }
};

// --- CRUD Controllers ---

export const getPublishedContent = async (req, res) => {
  try {
    const { page = 1, limit = 12, categoryId, subCategoryId, type, search } = req.query;
    let query = { isPublished: true, isVisible: true };

    if (categoryId) query.categoryId = categoryId;
    if (subCategoryId) query.subCategoryId = subCategoryId;
    if (type) query.type = type;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { excerpt: { $regex: search, $options: 'i' } }
      ];
    }

    const content = await FinanceContent.find(query)
      .sort({ publishedAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('categoryId', 'name icon')
      .populate('subCategoryId', 'name')
      .select('-content')
      .lean();

    const count = await FinanceContent.countDocuments(query);

    res.json({
      content,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page),
      total: count
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching content', error: error.message });
  }
};

export const getContentBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    const content = await FinanceContent.findOne({ slug, isPublished: true })
      .populate('categoryId', 'name icon')
      .populate('subCategoryId', 'name')
      .lean();

    if (!content) return res.status(404).json({ message: 'Content not found' });

    // Track unique view (simplified)
    await FinanceContent.findByIdAndUpdate(content._id, { 
      $inc: { 'analytics.views': 1 }
    });

    res.json(content);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching content', error: error.message });
  }
};

export const getAllContent = async (req, res) => {
  try {
    const { page = 1, limit = 20, search } = req.query;
    let query = {};
    if (search) {
      query.title = { $regex: search, $options: 'i' };
    }

    const content = await FinanceContent.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('categoryId', 'name')
      .populate('subCategoryId', 'name')
      .lean();

    const count = await FinanceContent.countDocuments(query);

    res.json({
      content,
      total: count,
      totalPages: Math.ceil(count / limit)
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching content', error: error.message });
  }
};

export const createContent = async (req, res) => {
  try {
    const data = req.body;
    const adminId = req.adminId || req.user._id;
    const admin = await Admin.findById(adminId);
    
    // Auto-generate publishedAt if publishing immediately
    if (data.isPublished) data.publishedAt = new Date();

    const content = await FinanceContent.create({
      ...data,
      authorId: adminId,
      authorName: admin?.fullName || 'Admin'
    });

    res.status(201).json(content);
  } catch (error) {
    res.status(400).json({ message: 'Error creating content', error: error.message });
  }
};

export const updateContent = async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;
    
    const content = await FinanceContent.findByIdAndUpdate(id, data, { new: true });
    if (!content) return res.status(404).json({ message: 'Content not found' });
    
    res.json(content);
  } catch (error) {
    res.status(400).json({ message: 'Error updating content', error: error.message });
  }
};

export const deleteContent = async (req, res) => {
  try {
    const { id } = req.params;
    const content = await FinanceContent.findByIdAndDelete(id);
    if (!content) return res.status(404).json({ message: 'Content not found' });
    res.json({ message: 'Content deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting content', error: error.message });
  }
};

export const togglePublishContent = async (req, res) => {
  try {
    const { id } = req.params;
    const content = await FinanceContent.findById(id);
    if (!content) return res.status(404).json({ message: 'Content not found' });
    
    content.isPublished = !content.isPublished;
    if (content.isPublished && !content.publishedAt) content.publishedAt = new Date();
    
    await content.save();
    res.json(content);
  } catch (error) {
    res.status(500).json({ message: 'Error toggling publish', error: error.message });
  }
};

export const toggleVisibility = async (req, res) => {
  try {
    const { id } = req.params;
    const content = await FinanceContent.findById(id);
    if (!content) return res.status(404).json({ message: 'Content not found' });
    content.isVisible = !content.isVisible;
    await content.save();
    res.json(content);
  } catch (error) {
    res.status(500).json({ message: 'Error toggling visibility', error: error.message });
  }
};

export const toggleFeatured = async (req, res) => {
  try {
    const { id } = req.params;
    const content = await FinanceContent.findById(id);
    if (!content) return res.status(404).json({ message: 'Content not found' });
    content.isFeatured = !content.isFeatured;
    await content.save();
    res.json(content);
  } catch (error) {
    res.status(500).json({ message: 'Error toggling featured', error: error.message });
  }
};
