import mongoose from 'mongoose';
const insightCommentSchema = new mongoose.Schema({
  insightId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CommunityInsight',
    required: true,
    index: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'userModel',
    required: true,
    index: true
  },
  userModel: {
    type: String,
    enum: ['Admin', 'User'],
    required: true
  },
  userName: {
    type: String,
    required: true,
    trim: true
  },
  commentText: {
    type: String,
    required: true,
    trim: true,
    maxlength: 500
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  likeCount: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

// Indexes for performance
insightCommentSchema.index({ insightId: 1, createdAt: -1 });


export default mongoose.model('InsightComment', insightCommentSchema);