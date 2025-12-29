const mongoose = require('mongoose');

const DemoQuizCategorySchema = new mongoose.Schema({
  name: { type: String, required: true },
}, { timestamps: true });

module.exports = mongoose.model('DemoQuizCategory', DemoQuizCategorySchema);
