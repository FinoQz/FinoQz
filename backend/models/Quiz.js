const mongoose = require("mongoose");

const quizSchema = new mongoose.Schema({
  category: { type: String, required: true },
  quizTitle: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  duration: { type: Number, required: true }, // minutes
  totalMarks: { type: Number, required: true },
  attemptLimit: { type: String, enum: ["unlimited", "1"], default: "1" },
  shuffleQuestions: { type: Boolean, default: false },
  negativeMarking: { type: Boolean, default: false },
  negativePerWrong: { type: Number, default: 0 },

  pricingType: { type: String, enum: ["free", "paid"], default: "free" },
  price: { type: Number, default: 0 },
  couponCode: { type: String },
  allowOfflinePayment: { type: Boolean, default: false },

  startAt: { type: Date, required: true },
  endAt: { type: Date, required: true },
  visibility: { type: String, enum: ["public", "unlisted", "private"], default: "public" },
  assignedGroups: [{ type: String }],

  coverImage: { type: String },
  tags: [{ type: String }],
  difficultyLevel: { type: String, enum: ["easy", "medium", "hard"], default: "medium" },

  status: { type: String, enum: ["draft", "published"], default: "draft" },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

  participantCount: { type: Number, default: 0 },
}, { timestamps: true });

quizSchema.index({ quizTitle: "text", category: 1, status: 1 });

module.exports = mongoose.model("Quiz", quizSchema);
