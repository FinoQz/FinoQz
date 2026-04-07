 import mongoose from 'mongoose';


const notificationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  actorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  type: { 
    type: String, 
    enum: ['like', 'comment', 'reply', 'share', 'certificate', 'system'], 
    required: true 
  },
  title: { type: String },
  message: { type: String },
  metadata: { type: mongoose.Schema.Types.Mixed },
  postId: { type: mongoose.Schema.Types.ObjectId, ref: 'CommunityPost' },
  commentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Comment' },
  read: { type: Boolean, default: false },
  isRead: { type: Boolean, default: false }
}, { timestamps: true });

export default mongoose.model('Notification', notificationSchema);