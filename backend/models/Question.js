const mongoose = require('mongoose');

const QuestionSchema = new mongoose.Schema({
  type: { type: String, enum: ['mcq', 'true-false', 'short-answer'], default: 'mcq' },
  text: { type: String, required: true },
  options: { type: [String], default: undefined }, // only for MCQ / true-false
  correct: { type: mongoose.Schema.Types.Mixed, default: null }, // index (number) or string for short-answer
  marks: { type: Number, default: 1 },
  confidence: { type: String, enum: ['high', 'medium', 'low'], default: 'medium' },
  status: { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
}, { timestamps: true });

module.exports = mongoose.model('Question', QuestionSchema);