const mongoose = require('mongoose');

const communityPostSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  content: {
    type: String,
    required: true
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    required: true
  },
  category: {
    type: String,
    enum: ['Announcements', 'Tips', 'Updates', 'General'],
    default: 'General',
    index: true
  },
  status: {
    type: String,
    enum: ['draft', 'published', 'archived'],
    default: 'draft',
    index: true
  },
  isPinned: {
    type: Boolean,
    default: false,
    index: true
  },
  likes: {
    type: Number,
    default: 0
  },
  views: {
    type: Number,
    default: 0
  },
  tags: [{
    type: String,
    trim: true
  }]
}, { timestamps: true });

// Compound indexes for performance
communityPostSchema.index({ status: 1, isPinned: -1, createdAt: -1 });
communityPostSchema.index({ category: 1, status: 1, createdAt: -1 });

module.exports = mongoose.model('CommunityPost', communityPostSchema);
