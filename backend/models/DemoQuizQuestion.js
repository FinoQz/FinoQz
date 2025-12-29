const mongoose = require('mongoose');

const DemoQuizQuestionSchema = new mongoose.Schema({
  categoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'DemoQuizCategory',
    required: true,
  },
  question: { type: String, required: true },
  options: [{ type: String, required: true }],
  correctIndex: { type: Number, required: true },
}, { timestamps: true });

module.exports = mongoose.model('DemoQuizQuestion', DemoQuizQuestionSchema);
