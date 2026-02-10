const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  quizId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Quiz'
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  currency: {
    type: String,
    default: 'INR',
    uppercase: true
  },
  status: {
    type: String,
    enum: ['pending', 'success', 'failed', 'refunded'],
    default: 'pending',
    index: true
  },
  paymentMethod: {
    type: String,
    enum: ['razorpay', 'stripe', 'offline', 'wallet', 'cashfree'],
    required: true
  },
  gatewayTransactionId: {
    type: String,
    sparse: true,
    index: true
  },
  gatewayResponse: {
    type: Object,
    default: {}
  },
  metadata: {
    type: Object,
    default: {}
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  completedAt: {
    type: Date
  }
}, { timestamps: true });

// Compound indexes for performance
transactionSchema.index({ userId: 1, status: 1 });
transactionSchema.index({ createdAt: -1 });
transactionSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model('Transaction', transactionSchema);
