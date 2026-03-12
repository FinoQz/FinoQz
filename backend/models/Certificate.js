import mongoose from 'mongoose';

const certificateSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  quizId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Quiz',
    required: true
  },
  attemptId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'QuizAttempt',
    required: true
  },
  certificateNumber: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  issueDate: {
    type: Date,
    default: Date.now,
    required: true
  },
  score: {
    type: Number,
    required: true
  },
  percentage: {
    type: Number,
    required: true
  },
  certificateUrl: {
    type: String // Cloudinary URL or local path
  },
  verificationCode: {
    type: String,
    required: true,
    unique: true,
    index: true
  }
}, { timestamps: true });

// Compound index for user certificates
certificateSchema.index({ userId: 1, issueDate: -1 });

export default mongoose.model('Certificate', certificateSchema);
