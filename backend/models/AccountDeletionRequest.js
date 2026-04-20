import mongoose from 'mongoose';

const accountDeletionRequestSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  reason: {
    type: String,
    trim: true,
    maxlength: 1000
  },
  requestedAt: {
    type: Date,
    default: Date.now
  },
  processedAt: {
    type: Date
  },
  processedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin'
  }
});

// Index for performance
accountDeletionRequestSchema.index({ user: 1 });
accountDeletionRequestSchema.index({ status: 1 });

export default mongoose.model('AccountDeletionRequest', accountDeletionRequestSchema);
