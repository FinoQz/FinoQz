'use strict';

const mongoose = require('mongoose');

const HeroSchema = new mongoose.Schema({
  title: { type: String, default: '' },
  subtitle: { type: String, default: '' },
  ctaText: { type: String, default: '' },
  ctaLink: { type: String, default: '' },
  imageUrl: { type: String, default: null },
});

const CategoryCardSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  title: { type: String, default: '' },
  description: { type: String, default: '' },
  bullets: { type: [String], default: [] },
});

const WhyCardSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  title: { type: String, default: '' },
  description: { type: String, default: '' },
});

const QuizQuestionSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  question: { type: String, default: '' },
  options: { type: [String], default: [] },
  correctIndex: { type: Number, default: 0 },
});

const DummyQuizSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  title: { type: String, default: '' },
  questions: { type: [QuizQuestionSchema], default: [] },
});

const LandingPageSchema = new mongoose.Schema(
  {
    hero: { type: HeroSchema, default: () => ({}) },
    categories: { type: [CategoryCardSchema], default: [] },
    whyCards: { type: [WhyCardSchema], default: [] },
    dummyQuiz: { type: DummyQuizSchema, default: null },
    updatedAt: { type: Date, default: Date.now },
  },
  { collection: 'landing_page' }
);

LandingPageSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('LandingPage', LandingPageSchema);