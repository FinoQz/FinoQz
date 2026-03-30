import mongoose from 'mongoose';

const communityInsightSchema = new mongoose.Schema({
  authorId: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'authorModel',
    required: true,
    index: true
  },
  authorModel: {
    type: String,
    enum: ['Admin', 'User'],
    required: true
  },
  authorName: {
    type: String,
    required: true,
    trim: true
  },
  content: {
    type: String,
    required: true,
    trim: true
  },
  images: [{
    type: String,
    trim: true
  }],
  category: {
    type: String,
    trim: true
  },
  tags: [{
    type: String,
    trim: true
  }],
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  likeCount: {
    type: Number,
    default: 0,
    index: true
  },
  commentCount: {
    type: Number,
    default: 0
  },
  shareCount: {
    type: Number,
    default: 0
  },
  isPinned: {
    type: Boolean,
    default: false,
    index: true
  },
  isActive: {
    type: Boolean,
    default: true,
    index: true
  }
}, { timestamps: true });

// Compound indexes for performance
communityInsightSchema.index({ isActive: 1, isPinned: -1, createdAt: -1 });
communityInsightSchema.index({ isActive: 1, likeCount: -1 });
communityInsightSchema.index({ authorId: 1, createdAt: -1 });

export default mongoose.model('CommunityInsight', communityInsightSchema);
