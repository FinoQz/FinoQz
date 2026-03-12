import mongoose from 'mongoose';

const quizActivityLogSchema = new mongoose.Schema({
  adminId: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin', required: true },
  action: { type: String, required: true }, // e.g., 'create_quiz', 'update_quiz', 'delete_quiz', 'publish_quiz', etc.
  quizId: { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz', required: true },
  meta: { type: Object, default: {} },
  status: { type: String, enum: ['success', 'failure'], default: 'success' },
  ip: String,
  device: { type: Object, default: {} },
  userAgent: String,
  createdAt: { type: Date, default: Date.now, expires: 604800 } // TTL: 7 days
}, { timestamps: true });

quizActivityLogSchema.index({ adminId: 1, quizId: 1, action: 1 });

export default mongoose.model('QuizActivityLog', quizActivityLogSchema);
