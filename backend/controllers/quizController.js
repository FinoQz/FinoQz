// controllers/quizController.js
// Fixed / hardened version of your controller:
// - removed stray typo
// - safer date parsing (no forced Z that shifts timezone)
// - partial-update whitelist for updateQuiz
// - getById returns { data: quiz } for frontend consistency
// - enroll uses req.params.quizId to match common route naming
// - basic input checks and numeric normalizations

const Quiz = require('../models/Quiz');
const Question = require('../models/Question');
const Transaction = require('../models/Transaction');
const QuizAttempt = require('../models/QuizAttempt');
const cloudinary = require('../utils/cloudinary');
const mongoose = require('mongoose');
const generatorService = require('../services/generatorService');
const User = require('../models/User');
const Group = require('../models/Group');

const ACTIVE_USER_STATUSES = new Set(['approved', 'active']);
const DEFAULT_LIVE_END_DAYS = 3650; // 10 years

const ensureActiveUser = async (req, res) => {
  if (!req.userId) {
    res.status(401).json({ message: 'Authentication required' });
    return null;
  }
  const user = await User.findById(req.userId).select('status').lean();
  if (!user) {
    res.status(401).json({ message: 'User not found' });
    return null;
  }
  const status = String(user.status || '').toLowerCase();
  if (!ACTIVE_USER_STATUSES.has(status)) {
    res.status(403).json({ message: 'User is not active' });
    return null;
  }
  return user;
};

const getUserGroupTokens = async (userId) => {
  const groups = await Group.find({ members: userId }).select('_id name').lean();
  const ids = groups.map(g => String(g._id));
  const names = groups.map(g => String(g.name || '')).filter(Boolean);
  return Array.from(new Set([...ids, ...names]));
};

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
      coupon, // { discountType, discountValue, visibility }
      postType
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
    const now = new Date();
    const isScheduled = postType === 'scheduled';
    const startAt = isScheduled
      ? parseDateTime(startDate, startTime)
      : now;
    const endAt = isScheduled
      ? parseDateTime(endDate, endTime)
      : (endDate && endTime ? parseDateTime(endDate, endTime) : new Date(now.getTime() + DEFAULT_LIVE_END_DAYS * 24 * 60 * 60 * 1000));

    if (!startAt || !endAt) {
      return res.status(400).json({ message: 'Invalid start or end date/time' });
    }

    // Groups logic
    let groups = [];
    if (visibility === 'private' && Array.isArray(assignedGroups)) {
      groups = assignedGroups.map(String);
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
    const user = await ensureActiveUser(req, res);
    if (!user) return;

    const { category, search, page = 1, limit = 20, upcoming } = req.query;
    const now = new Date();
    const userGroupTokens = await getUserGroupTokens(req.userId);
    const visibilityFilter = [{ visibility: 'public' }];
    if (userGroupTokens.length > 0) {
      visibilityFilter.push({ visibility: 'private', assignedGroups: { $in: userGroupTokens } });
    }

    const filter = {
      status: 'published',
      $or: visibilityFilter,
      startAt: { $lte: now },
      endAt: { $gte: now },
    };

    if (upcoming === 'true') {
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
    const user = await ensureActiveUser(req, res);
    if (!user) return;

    const id = req.params.id || req.params.quizId;
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ message: 'Invalid quiz id' });
    const quiz = await Quiz.findById(id);
    if (!quiz) return res.status(404).json({ message: "Quiz not found" });
    if (quiz.status !== 'published') return res.status(404).json({ message: 'Quiz not found' });

    const now = new Date();
    if (quiz.startAt && quiz.startAt > now) return res.status(404).json({ message: 'Quiz not found' });
    if (quiz.endAt && quiz.endAt < now) return res.status(404).json({ message: 'Quiz not found' });

    if (quiz.visibility === 'private') {
      const userGroupTokens = await getUserGroupTokens(req.userId);
      const assigned = Array.isArray(quiz.assignedGroups) ? quiz.assignedGroups.map(String) : [];
      const canAccess = assigned.some(g => userGroupTokens.includes(String(g)));
      if (!canAccess) return res.status(403).json({ message: 'Access denied' });
    }
    return res.json({ data: quiz });
  } catch (err) {
    console.error("❌ getById error:", err);
    return res.status(500).json({ message: "Server error fetching quiz" });
  }
};

// Admin get by id (no visibility/time restrictions)
exports.getAdminById = async (req, res) => {
  try {
    const id = req.params.id || req.params.quizId;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid quiz id' });
    }
    const quiz = await Quiz.findById(id);
    if (!quiz) return res.status(404).json({ message: 'Quiz not found' });
    return res.json({ data: quiz });
  } catch (err) {
    console.error('❌ getAdminById error:', err);
    return res.status(500).json({ message: 'Server error fetching quiz' });
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
    const user = await ensureActiveUser(req, res);
    if (!user) return;

    // support both :id and :quizId route param names
    const id = req.params.id || req.params.quizId;
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ message: 'Invalid quiz id' });

    const quiz = await Quiz.findById(id);
    if (!quiz) return res.status(404).json({ message: "Quiz not found" });

    if (quiz.status !== 'published') return res.status(404).json({ message: 'Quiz not found' });
    const now = new Date();
    if (quiz.startAt && quiz.startAt > now) return res.status(400).json({ message: 'Quiz is not active yet' });
    if (quiz.endAt && quiz.endAt < now) return res.status(400).json({ message: 'Quiz has ended' });

    if (quiz.visibility === 'private') {
      const userGroupTokens = await getUserGroupTokens(req.userId);
      const assigned = Array.isArray(quiz.assignedGroups) ? quiz.assignedGroups.map(String) : [];
      const canAccess = assigned.some(g => userGroupTokens.includes(String(g)));
      if (!canAccess) return res.status(403).json({ message: 'Access denied' });
    }

    const existingPurchase = await Transaction.findOne({
      userId: req.userId,
      quizId: id,
      status: 'success'
    });

    const existingAttempt = await QuizAttempt.findOne({
      userId: req.userId,
      quizId: id
    }).lean();

    if (!existingPurchase && !existingAttempt && quiz.pricingType === 'paid') {
      return res.status(400).json({ message: 'Payment required to enroll' });
    }

    let purchaseForEnroll = existingPurchase;
    if (!purchaseForEnroll && quiz.pricingType === 'free') {
      purchaseForEnroll = await Transaction.create({
        userId: req.userId,
        quizId: id,
        amount: 0,
        paymentMethod: 'offline',
        status: 'success',
        completedAt: new Date(),
        metadata: { kind: 'free_enroll' }
      });
    }

    const alreadyEnrolled = Boolean(existingAttempt) || Boolean(purchaseForEnroll?.metadata?.enrolled);
    if (alreadyEnrolled) {
      return res.json({ message: 'Already enrolled', participantCount: quiz.participantCount || 0 });
    }

    const updated = await Quiz.findByIdAndUpdate(
      id,
      { $inc: { participantCount: 1 } },
      { new: true }
    );
    if (!updated) return res.status(404).json({ message: "Quiz not found" });

    if (purchaseForEnroll) {
      purchaseForEnroll.metadata = { ...(purchaseForEnroll.metadata || {}), enrolled: true };
      await purchaseForEnroll.save();
    }
    return res.json({ message: "Enrolled", participantCount: updated.participantCount });
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

// Get quiz preview (2-3 sample questions for paid quizzes)
exports.getQuizPreview = async (req, res) => {
  try {
    const { quizId } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(quizId)) {
      return res.status(400).json({ message: 'Invalid quiz ID' });
    }

    const quiz = await Quiz.findById(quizId)
      .select('quizTitle description duration totalMarks pricingType price difficultyLevel category questions')
      .lean();

    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    let questionIds = Array.isArray(quiz.questions) ? quiz.questions.map(String) : [];

    let questions = questionIds.length > 0
      ? await Question.find({ _id: { $in: questionIds } })
          .select('text options type marks')
          .lean()
      : [];

    if (questionIds.length === 0) {
      questions = await Question.find({ quizId })
        .select('text options type marks')
        .lean();
      questionIds = questions.map(q => String(q._id));
      if (questionIds.length > 0) {
        await Quiz.updateOne(
          { _id: quizId },
          { $addToSet: { questions: { $each: questionIds } } }
        );
      }
    }

    const questionMap = new Map(questions.map(q => [String(q._id), q]));
    const orderedQuestions = questionIds
      .map(id => questionMap.get(id))
      .filter(Boolean)
      .slice(0, 3);

    // Remove correct answer information
    const previewQuestions = orderedQuestions.map(q => ({
      id: String(q._id),
      text: q.text,
      options: q.options || [],
      type: q.type || 'mcq',
      marks: q.marks
    }));

    return res.json({
      data: {
        quizId: quiz._id,
        title: quiz.quizTitle,
        description: quiz.description,
        duration: quiz.duration,
        totalMarks: quiz.totalMarks,
        pricingType: quiz.pricingType,
        price: quiz.price,
        difficultyLevel: quiz.difficultyLevel,
        category: quiz.category,
        previewQuestions,
        totalQuestions: questionIds.length,
        isPreview: true
      }
    });
  } catch (err) {
    console.error('Preview error:', err);
    return res.status(500).json({ message: 'Failed to fetch quiz preview' });
  }
};

// Get full quiz questions for attempt
exports.getQuizQuestions = async (req, res) => {
  try {
    const user = await ensureActiveUser(req, res);
    if (!user) return;

    const quizId = req.params.quizId || req.params.id;
    if (!mongoose.Types.ObjectId.isValid(quizId)) {
      return res.status(400).json({ message: 'Invalid quiz ID' });
    }

    const quiz = await Quiz.findById(quizId)
      .select('status startAt endAt visibility assignedGroups questions shuffleQuestions numberOfQuestions')
      .lean();

    if (!quiz || quiz.status !== 'published') {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    const now = new Date();
    if (quiz.startAt && quiz.startAt > now) {
      return res.status(404).json({ message: 'Quiz not found' });
    }
    if (quiz.endAt && quiz.endAt < now) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    if (quiz.visibility === 'private') {
      const userGroupTokens = await getUserGroupTokens(req.userId);
      const assigned = Array.isArray(quiz.assignedGroups) ? quiz.assignedGroups.map(String) : [];
      const canAccess = assigned.some(g => userGroupTokens.includes(String(g)));
      if (!canAccess) return res.status(403).json({ message: 'Access denied' });
    }

    let questionIds = Array.isArray(quiz.questions) ? quiz.questions.map(String) : [];
    let questions = questionIds.length > 0
      ? await Question.find({ _id: { $in: questionIds } })
          .select('text options type correct marks')
          .lean()
      : [];

    if (questionIds.length === 0) {
      questions = await Question.find({ quizId })
        .select('text options type correct marks')
        .lean();
      questionIds = questions.map(q => String(q._id));
      if (questionIds.length > 0) {
        await Quiz.updateOne(
          { _id: quizId },
          { $addToSet: { questions: { $each: questionIds } } }
        );
      }
    }

    if (questionIds.length === 0) {
      return res.json({ data: { questions: [] } });
    }

    const questionMap = new Map(questions.map(q => [String(q._id), q]));
    let orderedQuestions = questionIds
      .map(id => questionMap.get(id))
      .filter(Boolean);

    if (quiz.shuffleQuestions) {
      for (let i = orderedQuestions.length - 1; i > 0; i -= 1) {
        const j = Math.floor(Math.random() * (i + 1));
        [orderedQuestions[i], orderedQuestions[j]] = [orderedQuestions[j], orderedQuestions[i]];
      }
    }

    if (quiz.numberOfQuestions && orderedQuestions.length > quiz.numberOfQuestions) {
      orderedQuestions = orderedQuestions.slice(0, quiz.numberOfQuestions);
    }

    const normalized = orderedQuestions.map(q => ({
      id: String(q._id),
      type: q.type || 'mcq',
      text: q.text,
      options: Array.isArray(q.options) ? q.options : [],
      correctAnswer: typeof q.correct === 'number' ? q.correct : null,
      marks: typeof q.marks === 'number' ? q.marks : 1
    }));

    return res.json({ data: { questions: normalized } });
  } catch (err) {
    console.error('Get quiz questions error:', err);
    return res.status(500).json({ message: 'Failed to fetch quiz questions' });
  }
};

// Get user's purchased/enrolled quizzes
exports.getMyQuizzes = async (req, res) => {
  try {
    const userId = req.userId;
    
    if (!userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    // Get purchased quizzes from transactions
    const Transaction = require('../models/Transaction');
    const purchasedTransactions = await Transaction.find({
      userId,
      status: 'success',
      quizId: { $exists: true, $ne: null }
    }).select('quizId').lean();

    const purchasedQuizIds = purchasedTransactions
      .map(t => t.quizId)
      .filter(Boolean)
      .map(id => String(id));

    // Get quiz attempts to find enrolled/attempted quizzes
    const QuizAttempt = require('../models/QuizAttempt');
    const attempts = await QuizAttempt.find({ userId })
      .select('quizId status totalScore percentage submittedAt attemptNumber')
      .sort({ submittedAt: -1 })
      .lean();

    const attemptedQuizIds = [...new Set(attempts.map(a => String(a.quizId)))];
    
    // Combine all quiz IDs
    const allQuizIds = [...new Set([...purchasedQuizIds, ...attemptedQuizIds])];

    // Get quiz details
    const quizzes = await Quiz.find({ _id: { $in: allQuizIds } })
      .select('quizTitle description duration totalMarks pricingType price category difficultyLevel coverImage status')
      .lean();

    // Enrich with attempt information
    const enrichedQuizzes = quizzes.map(quiz => {
      const quizAttempts = attempts.filter(a => String(a.quizId) === String(quiz._id));
      const isPurchased = purchasedQuizIds.includes(String(quiz._id));
      
      let attemptStatus = 'not-started';
      let bestScore = null;
      let latestAttempt = null;
      
      if (quizAttempts.length > 0) {
        const completedAttempts = quizAttempts.filter(a => a.status === 'submitted');
        if (completedAttempts.length > 0) {
          attemptStatus = 'completed';
          bestScore = Math.max(...completedAttempts.map(a => a.percentage || 0));
          latestAttempt = completedAttempts[0];
        } else {
          const inProgressAttempt = quizAttempts.find(a => a.status === 'in_progress');
          if (inProgressAttempt) {
            attemptStatus = 'in-progress';
          }
        }
      }

      return {
        ...quiz,
        isPurchased,
        attemptStatus,
        bestScore,
        totalAttempts: quizAttempts.length,
        latestAttempt: latestAttempt ? {
          score: latestAttempt.totalScore,
          percentage: latestAttempt.percentage,
          submittedAt: latestAttempt.submittedAt,
          attemptNumber: latestAttempt.attemptNumber
        } : null
      };
    });

    return res.json({
      data: enrichedQuizzes,
      message: 'My quizzes fetched successfully'
    });
  } catch (err) {
    console.error('Get my quizzes error:', err);
    return res.status(500).json({ message: 'Failed to fetch your quizzes' });
  }
};