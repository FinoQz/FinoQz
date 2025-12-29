'use strict';

const mongoose = require('mongoose');
const { Schema } = mongoose;

/**
 * LandingPage model (improved)
 *
 * Notes:
 * - Use timestamps to automatically manage createdAt / updatedAt.
 * - Do NOT set `unique: true` on subdocument fields inside arrays (Mongo will try to create a collection-level index,
 *   which is usually not what you want for embedded documents). If you need uniqueness, create a top-level index.
 * - Add basic validators for quiz options and correctIndex.
 * - Guard model registration to avoid OverwriteModelError in dev with hot-reload.
 */

const HeroSchema = new Schema({
  title: { type: String, default: '' },
  subtitle: { type: String, default: '' },
  ctaText: { type: String, default: '' },
  ctaLink: { type: String, default: '' },
  imageUrl: { type: String, default: null },
});

const CategoryCardSchema = new Schema({
  id: { type: String, required: true },
  title: { type: String, default: '' },
  description: { type: String, default: '' },
  bullets: { type: [String], default: [] },
  shuffle: { type: Boolean, default: true },
  weight: { type: Number, default: 1 },
});

const WhyCardSchema = new Schema({
  id: { type: String, required: true },
  title: { type: String, default: '' },
  description: { type: String, default: '' },
});

const QuizQuestionSchema = new Schema({
  id: { type: String, required: true },
  question: { type: String, default: '' },
  options: {
    type: [String],
    default: [],
    validate: {
      validator: function (v) {
        // require between 2 and 6 options (you can adjust)
        return Array.isArray(v) && v.length >= 2 && v.length <= 6;
      },
      message: 'Options must be an array with 2 to 6 items.',
    },
  },
  correctIndex: {
    type: Number,
    default: 0,
    validate: {
      validator: function (val) {
        // ensure correctIndex points to an existing option
        const opts = this.options || [];
        return Number.isInteger(val) && opts.length > 0 && val >= 0 && val < opts.length;
      },
      message: 'correctIndex must be an integer pointing to a valid option index.',
    },
  },
});

const DummyQuizSchema = new Schema({
  id: { type: String, required: true },
  title: { type: String, default: '' },
  questions: { type: [QuizQuestionSchema], default: [] },
  showAnswersAfterSubmit: { type: Boolean, default: true },
});

const LandingPageSchema = new Schema(
  {
    hero: { type: HeroSchema, default: () => ({}) },
    categories: { type: [CategoryCardSchema], default: [] },
    whyCards: { type: [WhyCardSchema], default: [] },
    dummyQuiz: { type: DummyQuizSchema, default: null },
  },
  {
    collection: 'landing_page',
    timestamps: true, // adds createdAt and updatedAt
  }
);

// If you want to enforce uniqueness of category/quiz/question ids across the collection,
// create a top-level index instead of `unique` on subdocument fields.
// Example (uncomment to use):
// LandingPageSchema.index({ 'categories.id': 1 }, { unique: true, sparse: true });

module.exports = mongoose.models.LandingPage || mongoose.model('LandingPage', LandingPageSchema);