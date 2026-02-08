const mongoose = require('mongoose');

const quizAttemptSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  quizId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Quiz',
    required: true,
    index: true
  },
  attemptNumber: {
    type: Number,
    required: true,
    default: 1
  },
  startedAt: {
    type: Date,
    default: Date.now,
    required: true
  },
  submittedAt: {
    type: Date
  },
  answers: [{
    questionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Question',
      required: true
    },
    selectedAnswer: {
      type: mongoose.Schema.Types.Mixed
    },
    isCorrect: {
      type: Boolean,
      default: false
    },
    marksAwarded: {
      type: Number,
      default: 0
    },
    timeSpent: {
      type: Number, // seconds
      default: 0
    }
  }],
  totalScore: {
    type: Number,
    default: 0
  },
  percentage: {
    type: Number,
    default: 0
  },
  timeTaken: {
    type: Number, // seconds
    default: 0
  },
  status: {
    type: String,
    enum: ['in_progress', 'submitted', 'abandoned'],
    default: 'in_progress',
    index: true
  },
  certificateIssued: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

// Compound indexes for performance
quizAttemptSchema.index({ userId: 1, quizId: 1, attemptNumber: 1 });
quizAttemptSchema.index({ submittedAt: -1 });
quizAttemptSchema.index({ status: 1, submittedAt: -1 });

module.exports = mongoose.model('QuizAttempt', quizAttemptSchema);
