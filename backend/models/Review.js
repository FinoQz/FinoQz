const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  name: { type: String, default: 'Anonymous', trim: true },
  email: { type: String, trim: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  reviewText: { type: String, required: true, trim: true, maxlength: 1000 },
  isPinned: { type: Boolean, default: false, index: true },
  isApproved: { type: Boolean, default: false, index: true }
}, { timestamps: true });

// Indexes for performance
reviewSchema.index({ isPinned: -1, isApproved: -1, createdAt: -1 });

module.exports = mongoose.model('Review', reviewSchema);