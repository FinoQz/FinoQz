import mongoose from 'mongoose';

const financeEngagementSchema = new mongoose.Schema({
  resourceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'FinanceContent',
    required: true,
    index: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  userName: {
    type: String,
    required: true
  },
  userAvatar: {
    type: String
  },
  text: {
    type: String,
    required: true,
    trim: true,
    maxlength: 2000
  },
  parentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'FinanceEngagement',
    default: null,
    index: true
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  isDeleted: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

// Compound index for fetching discussions for a resource efficiently
financeEngagementSchema.index({ resourceId: 1, createdAt: -1 });

export default mongoose.model('FinanceEngagement', financeEngagementSchema);
