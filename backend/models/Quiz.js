import mongoose from "mongoose";

const quizSchema = new mongoose.Schema({
  category: { type: String },
  quizTitle: { type: String, required: true, trim: true },
  description: { type: String },
  duration: { type: Number, default: 30 }, // minutes
  totalMarks: { type: Number, default: 0 },
  attemptLimit: { type: String, enum: ["unlimited", "1"], default: "1" },
  shuffleQuestions: { type: Boolean, default: false },
  negativeMarking: { type: Boolean, default: false },
  negativePerWrong: { type: Number, default: 0 },

  pricingType: { type: String, enum: ["free", "paid"], default: "free" },
  price: { type: Number, default: 0 },
  couponCode: { type: String },
  offerCode: { type: String },
  allowOfflinePayment: { type: Boolean, default: false },

  startAt: { type: Date, required: true },
  endAt: { type: Date },
  scheduledAt: { type: Date }, // Time when the quiz should be published
  visibility: { type: String, enum: ["public", "unlisted", "private", "individual"], default: "public" },
  assignedGroups: [{ type: String }],
  assignedIndividuals: [{ type: String }],

  coverImage: { type: String },
  tags: [{ type: String }],
  difficultyLevel: { type: String, enum: ["easy", "medium", "hard"], default: "medium" },

  showResults: { type: Boolean, default: true },
  showCorrectAnswers: { type: Boolean, default: true },

  status: { type: String, enum: ["draft", "published", "scheduled"], default: "draft" },
  broadcastEmail: { type: Boolean, default: false },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

  enrolledCount: { type: Number, default: 0 },
  participantCount: { type: Number, default: 0 },

  questions: [{ type: mongoose.Schema.Types.ObjectId, ref: "Question" }],
  landingDemoQuestions: [{ type: mongoose.Schema.Types.ObjectId, ref: "Question" }],
}, { timestamps: true });

quizSchema.index({ quizTitle: "text", category: 1, status: 1 });
quizSchema.index({ assignedIndividuals: 1, visibility: 1 });
quizSchema.index({ assignedGroups: 1, visibility: 1 });

export default mongoose.model("Quiz", quizSchema);
