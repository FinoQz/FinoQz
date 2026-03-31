import mongoose from 'mongoose';

const DemoQuizCategorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  bullets: [{ type: String }],
  imageUrl: { type: String },
}, { timestamps: true });

export default mongoose.model('DemoQuizCategory', DemoQuizCategorySchema);
