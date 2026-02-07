// controllers/quizController.js
// Fixed / hardened version of your controller:
// - removed stray typo
// - safer date parsing (no forced Z that shifts timezone)
// - partial-update whitelist for updateQuiz
// - getById returns { data: quiz } for frontend consistency
// - enroll uses req.params.quizId to match common route naming
// - basic input checks and numeric normalizations

const Quiz = require('../models/Quiz');
const cloudinary = require('../utils/cloudinary');
const mongoose = require('mongoose');
const generatorService = require('../services/generatorService');

// Helpers
const parseDateTime = (dateStr, timeStr) => {
  if (!dateStr || !timeStr) return null;
  const iso = `${dateStr}T${timeStr}:00`;
  const d = new Date(iso);
  if (isNaN(d.getTime())) return null;
  return d;
};

// Allowed fields for update to avoid accidental overwrite
const ALLOWED_UPDATE_FIELDS = new Set([
  'category',
  'quizTitle',
  'description',
  'duration',
  'totalMarks',
  'attemptLimit',
  'shuffleQuestions',
  'negativeMarking',
  'negativePerWrong',
  'pricingType',
  'price',
  'couponCode',
  'allowOfflinePayment',
  'startAt',
  'endAt',
  'visibility',
  'assignedGroups',
  'tags',
  'difficultyLevel',
  'coverImage',
  'status',
  'saveAsDraft'
]);

// Create quiz
exports.createQuiz = async (req, res) => {
  try {
    const {
      category,
      pricingType, price, couponCode, allowOfflinePayment,
      quizTitle, description, duration, totalMarks,
      attemptLimit, shuffleQuestions, negativeMarking, negativePerWrong,
      startDate, startTime, endDate, endTime,
      visibility, assignedGroups,
      tags, difficultyLevel, coverImage,
      saveAsDraft,
      numberOfQuestions,
      coupon // { discountType, discountValue, visibility }
    } = req.body;

    if (!quizTitle || !description) {
      return res.status(400).json({ message: 'quizTitle and description are required' });
    }

    // Cover image upload (base64)
    let coverImageUrl = '';
    if (coverImage && coverImage.startsWith('data:')) {
      const uploadRes = await cloudinary.uploader.upload(coverImage, { folder: 'quiz-covers' });
      coverImageUrl = uploadRes.secure_url;
    } else if (coverImage) {
      coverImageUrl = coverImage;
    }

    // Coupon logic
    let couponDetails = {};
    if (pricingType === 'paid' && coupon) {
      couponDetails = {
        code: couponCode || coupon.code,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        visibility: coupon.visibility
      };
    }

    // Dates
    const startAt = startDate && startTime ? parseDateTime(startDate, startTime) : undefined;
    const endAt = endDate && endTime ? parseDateTime(endDate, endTime) : undefined;

    // Groups logic
    let groups = [];
    if (visibility === 'private' && Array.isArray(assignedGroups)) {
      groups = assignedGroups;
    }

    const quiz = new Quiz({
      category,
      pricingType,
      price: pricingType === 'paid' ? Number(price || 0) : 0,
      couponCode: couponDetails.code,
      allowOfflinePayment: !!allowOfflinePayment,
      quizTitle,
      description,
      duration: Number(duration || 0),
      totalMarks: Number(totalMarks || 0),
      numberOfQuestions: Number(numberOfQuestions || 0),
      attemptLimit,
      shuffleQuestions: !!shuffleQuestions,
      negativeMarking: !!negativeMarking,
      negativePerWrong: Number(negativePerWrong || 0),
      ...(startAt ? { startAt } : {}),
      ...(endAt ? { endAt } : {}),
      visibility,
      assignedGroups: groups,
      tags: Array.isArray(tags) ? tags : [],
      difficultyLevel,
      coverImage: coverImageUrl,
      status: saveAsDraft ? 'draft' : 'published',
      createdBy: req.adminId || req.userId || null,
      coupon: couponDetails
    });

    await quiz.save();
    return res.status(201).json({ message: "Quiz created successfully", data: quiz });
  } catch (err) {
    console.error("❌ createQuiz error:", err);
    return res.status(500).json({ message: err.message || "Server error creating quiz" });
  }
};

// AI description generator
exports.generateDescription = async (req, res) => {
  try {
    const { quizTitle } = req.body;
    if (!quizTitle) return res.status(400).json({ message: 'quizTitle required' });
    const result = await generatorService.generateDescription(quizTitle);
    return res.json({ description: result });
  } catch (err) {
    return res.status(500).json({ message: 'AI description generation failed' });
  }
};

// Update quiz (partial, whitelisted)
exports.updateQuiz = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ message: 'Invalid quiz id' });

    const incoming = { ...req.body };
    const update = {};

    // accept startDate/startTime or startAt directly
    if (incoming.startDate && incoming.startTime) {
      const parsed = parseDateTime(incoming.startDate, incoming.startTime);
      if (parsed) update.startAt = parsed;
    } else if (incoming.startAt) {
      const d = new Date(incoming.startAt);
      if (!isNaN(d.getTime())) update.startAt = d;
    }

    if (incoming.endDate && incoming.endTime) {
      const parsed = parseDateTime(incoming.endDate, incoming.endTime);
      if (parsed) update.endAt = parsed;
    } else if (incoming.endAt) {
      const d = new Date(incoming.endAt);
      if (!isNaN(d.getTime())) update.endAt = d;
    }

    // copy allowed fields only
    Object.keys(incoming).forEach(key => {
      if (ALLOWED_UPDATE_FIELDS.has(key) && key !== 'startAt' && key !== 'endAt') {
        update[key] = incoming[key];
      }
    });

    // normalize numbers
    if (update.duration !== undefined) update.duration = Number(update.duration || 0);
    if (update.totalMarks !== undefined) update.totalMarks = Number(update.totalMarks || 0);
    if (update.negativePerWrong !== undefined) update.negativePerWrong = Number(update.negativePerWrong || 0);
    if (update.price !== undefined) update.price = Number(update.price || 0);

    // arrays normalization
    if (update.assignedGroups && !Array.isArray(update.assignedGroups)) update.assignedGroups = [];
    if (update.tags && !Array.isArray(update.tags)) update.tags = [];

    const quiz = await Quiz.findByIdAndUpdate(id, update, { new: true, runValidators: true });
    if (!quiz) return res.status(404).json({ message: "Quiz not found" });

    return res.json({ message: "Quiz updated", data: quiz });
  } catch (err) {
    console.error("❌ updateQuiz error:", err);
    if (err.name === 'ValidationError') {
      return res.status(400).json({ message: 'Validation failed', details: err.errors });
    }
    return res.status(500).json({ message: "Server error updating quiz" });
  }
};

// Publish/unpublish
exports.setStatus = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ message: 'Invalid quiz id' });
    const { status } = req.body; // 'draft' | 'published'
    const quiz = await Quiz.findByIdAndUpdate(id, { status }, { new: true, runValidators: true });
    if (!quiz) return res.status(404).json({ message: "Quiz not found" });
    return res.json({ message: "Status updated", data: quiz });
  } catch (err) {
    console.error("❌ setStatus error:", err);
    return res.status(500).json({ message: "Server error updating status" });
  }
};

// Admin list (with filters + pagination)
exports.listAdmin = async (req, res) => {
  try {
    const { status, category, search, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (category) filter.category = category;
    if (search) filter.$text = { $search: search };

    const skip = (Number(page) - 1) * Number(limit);
    const [data, total] = await Promise.all([
      Quiz.find(filter).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
      Quiz.countDocuments(filter),
    ]);

    return res.json({
      data,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      }
    });
  } catch (err) {
    console.error("❌ listAdmin error:", err);
    return res.status(500).json({ message: "Server error fetching quizzes" });
  }
};

// Public list (user panel)
exports.listPublic = async (req, res) => {
  try {
    const { category, search, page = 1, limit = 20, upcoming } = req.query;
    const now = new Date();
    const filter = {
      status: 'published',
      visibility: 'public',
      startAt: { $lte: now },
      endAt: { $gte: now },
    };

    if (upcoming === 'true') {
      delete filter.startAt;
      filter.startAt = { $gt: now };
    }
    if (category) filter.category = category;
    if (search) filter.$text = { $search: search };

    const skip = (Number(page) - 1) * Number(limit);
    const [data, total] = await Promise.all([
      Quiz.find(filter).sort({ startAt: 1 }).skip(skip).limit(Number(limit)),
      Quiz.countDocuments(filter),
    ]);

    return res.json({
      data,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      }
    });
  } catch (err) {
    console.error("❌ listPublic error:", err);
    return res.status(500).json({ message: "Server error fetching quizzes" });
  }
};

// Get by id (user or admin) - consistent response shape
exports.getById = async (req, res) => {
  try {
    const id = req.params.id || req.params.quizId;
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ message: 'Invalid quiz id' });
    const quiz = await Quiz.findById(id);
    if (!quiz) return res.status(404).json({ message: "Quiz not found" });
    return res.json({ data: quiz });
  } catch (err) {
    console.error("❌ getById error:", err);
    return res.status(500).json({ message: "Server error fetching quiz" });
  }
};

// Delete quiz
exports.deleteQuiz = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ message: 'Invalid quiz id' });
    const del = await Quiz.findByIdAndDelete(id);
    if (!del) return res.status(404).json({ message: "Quiz not found" });
    return res.json({ message: "Quiz deleted" });
  } catch (err) {
    console.error("❌ deleteQuiz error:", err);
    return res.status(500).json({ message: "Server error deleting quiz" });
  }
};

// Enroll (increment participantCount) — user panel action
exports.enroll = async (req, res) => {
  try {
    // support both :id and :quizId route param names
    const id = req.params.id || req.params.quizId;
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ message: 'Invalid quiz id' });

    const quiz = await Quiz.findByIdAndUpdate(
      id,
      { $inc: { participantCount: 1 } },
      { new: true }
    );
    if (!quiz) return res.status(404).json({ message: "Quiz not found" });
    return res.json({ message: "Enrolled", participantCount: quiz.participantCount });
  } catch (err) {
    console.error("❌ enroll error:", err);
    return res.status(500).json({ message: "Server error enrolling" });
  }
};

// Generate questions from prompt
exports.generateQuestions = async (req, res) => {
  try {
    const { prompt, numQuestions, topic } = req.body;
    const result = await require('../services/generatorService').generateFromPrompt(prompt, numQuestions, topic);
    // Normalize for frontend
    const normalized = Array.isArray(result.questions)
      ? result.questions.map(q => ({
          text: String(q.text || '').trim(),
          options: Array.isArray(q.options) ? q.options.map(String) : ['', '', '', ''],
          correct: typeof q.correct === 'number' ? q.correct : 0,
          explanation: q.explanation ? String(q.explanation) : ''
        })).filter(q => q.text)
      : [];
    return res.json({ data: normalized });
  } catch (err) {
    return res.status(500).json({ message: 'AI question generation failed' });
  }
};