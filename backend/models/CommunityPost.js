import mongoose from 'mongoose';

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
    refPath: 'authorModel',
    required: true
  },
  authorModel: {
    type: String,
    enum: ['Admin', 'User'],
    required: true
  },
  category: {
    type: String,
    enum: ['Announcements', 'Tips', 'Updates', 'General', 'Discussions', 'Q&A'],
    default: 'General',
    index: true
  },
  status: {
    type: String,
    enum: ['draft', 'published', 'archived', 'flagged'],
    default: 'draft',
    index: true
  },
  isPinned: {
    type: Boolean,
    default: false,
    index: true
  },
  featuredOnLanding: {
    type: Boolean,
    default: false,
    index: true
  },
  allowComments: {
    type: Boolean,
    default: true
  },
  likes: {
    count: { type: Number, default: 0 },
    users: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
  },
  shares: {
    type: Number,
    default: 0
  },
  views: {
    type: Number,
    default: 0
  },
  commentsCount: {
    type: Number,
    default: 0
  },
  flags: [{
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    reason: { type: String, trim: true },
    createdAt: { type: Date, default: Date.now }
  }],
  tags: [{
    type: String,
    trim: true
  }]
}, { timestamps: true });

// Compound indexes for performance
communityPostSchema.index({ status: 1, isPinned: -1, createdAt: -1 });
communityPostSchema.index({ category: 1, status: 1, createdAt: -1 });
communityPostSchema.index({ featuredOnLanding: 1, status: 1, createdAt: -1 });

export default mongoose.model('CommunityPost', communityPostSchema);
