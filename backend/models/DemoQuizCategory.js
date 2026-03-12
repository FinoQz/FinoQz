import mongoose from 'mongoose';

const DemoQuizCategorySchema = new mongoose.Schema({
  name: { type: String, required: true },
}, { timestamps: true });

export default mongoose.model('DemoQuizCategory', DemoQuizCategorySchema);
