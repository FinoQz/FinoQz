import mongoose from 'mongoose';

const DemoQuizQuestionSchema = new mongoose.Schema({
  categoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'DemoQuizCategory',
    required: true,
  },
  question: { type: String, required: true },
  options: [{ type: String, required: true }],
  correctIndex: { type: Number, required: true },
  explanation: { type: String, required: true, trim: true },
}, { timestamps: true });

export default mongoose.model('DemoQuizQuestion', DemoQuizQuestionSchema);
