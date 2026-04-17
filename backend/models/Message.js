import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true,
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'senderModel',
    required: true
  },
  senderModel: {
    type: String,
    enum: ['Admin', 'User'],
    required: true
  },
  receiver: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'receiverModel'
  },
  receiverModel: {
    type: String,
    enum: ['Admin', 'User']
  },
  groupId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Group'
  },
  isRead: {
    type: Boolean,
    default: false
  },
  isDeleted: {
    type: Boolean,
    default: false
  },
  isEdited: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

// Indexes for fast fetching
messageSchema.index({ sender: 1, receiver: 1, createdAt: -1 });
messageSchema.index({ groupId: 1, createdAt: -1 });

export default mongoose.model('Message', messageSchema);
