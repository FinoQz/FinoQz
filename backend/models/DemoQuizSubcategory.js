import mongoose from 'mongoose';

const DemoQuizSubcategorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  categoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'DemoQuizCategory',
    required: true,
  },
}, { timestamps: true });

export default mongoose.model('DemoQuizSubcategory', DemoQuizSubcategorySchema);
