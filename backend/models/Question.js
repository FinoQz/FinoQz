const mongoose = require("mongoose");

const QuestionSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['mcq', 'true-false', 'short-answer'],
    default: 'mcq'
  },

  text: {
    type: String,
    required: true
  },

  options: {
    type: [String],
    default: undefined
  },

  correct: {
    type: mongoose.Schema.Types.Mixed,
    default: null
  },

  explanation: {          // 👈 ADD THIS
    type: String,
    default: ''
  },

  marks: {
    type: Number,
    default: 1
  },

  confidence: {
    type: String,
    enum: ['high', 'medium', 'low'],
    default: 'medium'
  },

  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected'],
    default: 'pending'
  },

  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },

  quizId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Quiz',
    default: null
  }

}, { timestamps: true });

module.exports = mongoose.model('Question', QuestionSchema);
