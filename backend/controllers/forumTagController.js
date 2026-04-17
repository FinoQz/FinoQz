import ForumTag from '../models/ForumTag.js';

// GET /api/forum-tags
export const getForumTags = async (req, res) => {
  try {
    const tags = await ForumTag.find().sort({ order: 1, name: 1 }).lean();
    res.json({ tags });
  } catch (error) {
    console.error('Get tags error:', error);
    res.status(500).json({ message: 'Failed to fetch tags' });
  }
};

// POST /api/forum-tags (Admin only)
export const createForumTag = async (req, res) => {
  try {
    const { name, type, order } = req.body;
    if (!name || !type) {
      return res.status(400).json({ message: 'Name and type are required' });
    }
    
    // Check if it already exists
    const existing = await ForumTag.findOne({ name, type });
    if (existing) {
      return res.status(400).json({ message: `A ${type} named ${name} already exists.` });
    }

    const tag = await ForumTag.create({ name, type, order: order || 0 });
    res.status(201).json({ message: 'Tag created', tag });
  } catch (error) {
    console.error('Create tag error:', error);
    res.status(500).json({ message: 'Failed to create tag', error: error.message });
  }
};

// DELETE /api/forum-tags/:id (Admin only)
export const deleteForumTag = async (req, res) => {
  try {
    const { id } = req.params;
    await ForumTag.findByIdAndDelete(id);
    res.json({ message: 'Tag deleted successfully' });
  } catch (error) {
    console.error('Delete tag error:', error);
    res.status(500).json({ message: 'Failed to delete tag' });
  }
};
