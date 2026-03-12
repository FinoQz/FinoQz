import FinanceContent from '../models/FinanceContent.js';
import Admin from '../models/Admin.js';

// GET /api/finance-content - Get all published content (paginated, filtered)
const getPublishedContent = async (req, res) => {
  try {
    const { page = 1, limit = 12, category, search } = req.query;
    
    let query = { isPublished: true };
    
    if (category) {
      query.category = category;
    }
    
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
      .select('-content') // Exclude full content for list view
      .lean();
    
    const count = await FinanceContent.countDocuments(query);
    
    res.json({
      content,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page),
      total: count
    });
  } catch (error) {
    console.error('Get published content error:', error);
    res.status(500).json({ message: 'Failed to fetch content' });
  }
};

// GET /api/finance-content/:slug - Get single content by slug
const getContentBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    
    const content = await FinanceContent.findOne({ 
      slug, 
      isPublished: true 
    }).lean();
    
    if (!content) {
      return res.status(404).json({ message: 'Content not found' });
    }
    
    // Increment view count
    await FinanceContent.findByIdAndUpdate(content._id, { 
      $inc: { views: 1 } 
    });
    
    // Get related content
    const relatedContent = await FinanceContent.find({
      _id: { $ne: content._id },
      category: content.category,
      isPublished: true
    })
      .sort({ publishedAt: -1 })
      .limit(3)
      .select('-content')
      .lean();
    
    res.json({ content, relatedContent });
  } catch (error) {
    console.error('Get content by slug error:', error);
    res.status(500).json({ message: 'Failed to fetch content' });
  }
};

// POST /api/admin/finance-content - Create new content (admin only)
const createContent = async (req, res) => {
  try {
    const { title, excerpt, content, thumbnail, category, tags } = req.body;
    
    if (!title || !content) {
      return res.status(400).json({ message: 'Title and content are required' });
    }
    
    const adminId = req.adminId || req.user._id || req.user.id;
    const admin = await Admin.findById(adminId).select('fullName email');
    const authorName = admin?.fullName || admin?.email || 'Admin';
    
    const financeContent = await FinanceContent.create({
      title,
      excerpt: excerpt || '',
      content,
      thumbnail: thumbnail || '',
      authorId: adminId,
      authorName,
      category: category || 'Other',
      tags: tags || []
    });
    
    res.status(201).json({
      message: 'Content created successfully',
      content: financeContent
    });
  } catch (error) {
    console.error('Create content error:', error);
    res.status(500).json({ message: 'Failed to create content' });
  }
};

// PUT /api/admin/finance-content/:id - Update content (admin only)
const updateContent = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, excerpt, content, thumbnail, category, tags } = req.body;
    
    const financeContent = await FinanceContent.findById(id);
    if (!financeContent) {
      return res.status(404).json({ message: 'Content not found' });
    }
    
    // Update fields - slug will be regenerated automatically by pre-save hook when title changes
    if (title) financeContent.title = title;
    if (excerpt !== undefined) financeContent.excerpt = excerpt;
    if (content) financeContent.content = content;
    if (thumbnail !== undefined) financeContent.thumbnail = thumbnail;
    if (category) financeContent.category = category;
    if (tags) financeContent.tags = tags;
    
    await financeContent.save();
    
    res.json({
      message: 'Content updated successfully',
      content: financeContent
    });
  } catch (error) {
    console.error('Update content error:', error);
    res.status(500).json({ message: 'Failed to update content' });
  }
};

// DELETE /api/admin/finance-content/:id - Delete content (admin only)
const deleteContent = async (req, res) => {
  try {
    const { id } = req.params;
    
    const content = await FinanceContent.findByIdAndDelete(id);
    if (!content) {
      return res.status(404).json({ message: 'Content not found' });
    }
    
    res.json({ message: 'Content deleted successfully' });
  } catch (error) {
    console.error('Delete content error:', error);
    res.status(500).json({ message: 'Failed to delete content' });
  }
};

// PATCH /api/admin/finance-content/:id/publish - Publish/unpublish content
const togglePublishContent = async (req, res) => {
  try {
    const { id } = req.params;
    
    const content = await FinanceContent.findById(id);
    if (!content) {
      return res.status(404).json({ message: 'Content not found' });
    }
    
    content.isPublished = !content.isPublished;
    await content.save();
    
    res.json({
      message: `Content ${content.isPublished ? 'published' : 'unpublished'} successfully`,
      content
    });
  } catch (error) {
    console.error('Toggle publish content error:', error);
    res.status(500).json({ message: 'Failed to update content' });
  }
};

// GET /api/admin/finance-content/all - Get all content including drafts
const getAllContent = async (req, res) => {
  try {
    const { page = 1, limit = 20, filter, search } = req.query;
    
    let query = {};
    
    if (filter === 'published') {
      query.isPublished = true;
    } else if (filter === 'draft') {
      query.isPublished = false;
    }
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { excerpt: { $regex: search, $options: 'i' } }
      ];
    }
    
    const content = await FinanceContent.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .select('-content') // Exclude full content for list view
      .lean();
    
    const count = await FinanceContent.countDocuments(query);
    
    // Get analytics
    const totalPublished = await FinanceContent.countDocuments({ isPublished: true });
    const totalDrafts = await FinanceContent.countDocuments({ isPublished: false });
    const totalViews = await FinanceContent.aggregate([
      { $group: { _id: null, total: { $sum: '$views' } } }
    ]);
    
    res.json({
      content,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page),
      total: count,
      analytics: {
        totalPublished,
        totalDrafts,
        totalViews: totalViews[0]?.total || 0
      }
    });
  } catch (error) {
    console.error('Get all content error:', error);
    res.status(500).json({ message: 'Failed to fetch content' });
  }
};

export {
  getPublishedContent,
  getContentBySlug,
  createContent,
  updateContent,
  deleteContent,
  togglePublishContent,
  getAllContent
};
