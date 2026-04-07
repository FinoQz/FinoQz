// controllers/quizController.js
// Fixed / hardened version of your controller:
// - removed stray typo
// - safer date parsing (no forced Z that shifts timezone)
// - partial-update whitelist for updateQuiz
// - getById returns { data: quiz } for frontend consistency
// - enroll uses req.params.quizId to match common route naming
// - basic input checks and numeric normalizations


import Quiz from '../models/Quiz.js';
import Question from '../models/Question.js';
import Transaction from '../models/Transaction.js';
import QuizAttempt from '../models/QuizAttempt.js';
import cloudinary from '../utils/cloudinary.js';
import mongoose from 'mongoose';
import { generateDescription, generateFromPrompt } from '../services/generatorService.js';
import User from '../models/User.js';
import Group from '../models/Group.js';
import QuizActivityLog from '../models/QuizActivityLog.js';
import emailQueue from '../utils/emailQueue.js';
import quizAssignmentTemplate from '../emailTemplates/quizAssignmentTemplate.js';

const ACTIVE_USER_STATUSES = new Set(['approved', 'active']);
const DEFAULT_LIVE_END_DAYS = 3650; // 10 years

const ensureActiveUser = async (req, res) => {
  if (!req.userId) {
    res.status(401).json({ message: 'Authentication required' });
    return null;
  }
  const user = await User.findById(req.userId).select('status email').lean();
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

const normalizeEmail = (value) => String(value || '').trim().toLowerCase();

const escapeRegExp = (value) => String(value || '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const normalizeStringArray = (arr) => {
  if (!Array.isArray(arr)) return [];
  return Array.from(new Set(arr.map((v) => String(v || '').trim()).filter(Boolean)));
};

const normalizeIndividualsArray = (arr) => {
  const values = normalizeStringArray(arr);
  return Array.from(
    new Set(
      values.map((value) => {
        if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          return normalizeEmail(value);
        }
        return value;
      })
    )
  );
};

const splitUserTokens = (tokens = []) => {
  const normalized = normalizeStringArray(tokens);
  const ids = [];
  const emails = [];
  normalized.forEach((value) => {
    if (mongoose.Types.ObjectId.isValid(value)) ids.push(value);
    if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) emails.push(value.toLowerCase());
  });
  return { normalized, ids, emails };
};

const resolveEmailsFromGroups = async (groupTokens = []) => {
  const normalized = normalizeStringArray(groupTokens);
  if (normalized.length === 0) return [];

  const groupIdTokens = normalized.filter((token) => mongoose.Types.ObjectId.isValid(token));
  const groupNameTokens = normalized.filter((token) => !mongoose.Types.ObjectId.isValid(token));

  const criteria = [];
  if (groupIdTokens.length > 0) {
    criteria.push({ _id: { $in: groupIdTokens.map((id) => new mongoose.Types.ObjectId(id)) } });
  }
  if (groupNameTokens.length > 0) {
    criteria.push({ name: { $in: groupNameTokens } });
  }
  if (criteria.length === 0) return [];

  const groups = await Group.find({ $or: criteria }).select('name members').lean();
  const memberIds = Array.from(
    new Set(
      groups
        .flatMap((group) => (Array.isArray(group.members) ? group.members : []))
        .map((member) => String(member))
        .filter(Boolean)
    )
  );

  if (memberIds.length === 0) return [];

  const users = await User.find({ _id: { $in: memberIds } }).select('fullName email').lean();
  const groupNames = groups.map((group) => String(group.name || 'Group')).filter(Boolean);
  const viaLabel = groupNames.length > 0 ? `Group: ${groupNames.join(', ')}` : 'Group assignment';

  return users
    .filter((user) => typeof user.email === 'string' && user.email.trim())
    .map((user) => ({
      email: String(user.email).toLowerCase(),
      fullName: String(user.fullName || 'Learner'),
      assignedVia: viaLabel,
    }));
};

const resolveEmailsFromIndividuals = async (individualTokens = []) => {
  const { normalized, ids, emails } = splitUserTokens(individualTokens);
  if (normalized.length === 0) return [];

  const criteria = [];
  if (ids.length > 0) {
    criteria.push({ _id: { $in: ids.map((id) => new mongoose.Types.ObjectId(id)) } });
  }
  if (emails.length > 0) {
    criteria.push({ email: { $in: emails } });
  }

  const users = criteria.length > 0
    ? await User.find({ $or: criteria }).select('fullName email').lean()
    : [];

  const matchedEmails = new Set();
  const recipients = users
    .filter((user) => typeof user.email === 'string' && user.email.trim())
    .map((user) => {
      const email = String(user.email).toLowerCase();
      matchedEmails.add(email);
      return {
        email,
        fullName: String(user.fullName || 'Learner'),
        assignedVia: 'Direct assignment',
      };
    });

  emails.forEach((email) => {
    if (matchedEmails.has(email)) return;
    recipients.push({
      email,
      fullName: email.split('@')[0] || 'Learner',
      assignedVia: 'Direct assignment',
    });
  });

  return recipients;
};

const queueQuizAssignmentEmails = async ({ previousQuiz, updatedQuiz }) => {
  if (!updatedQuiz) return;

  const prevVisibility = String(previousQuiz?.visibility || '');
  const nextVisibility = String(updatedQuiz.visibility || '');

  let recipients = [];

  if (nextVisibility === 'private') {
    const prevGroups = prevVisibility === 'private' ? normalizeStringArray(previousQuiz?.assignedGroups) : [];
    const nextGroups = normalizeStringArray(updatedQuiz.assignedGroups);
    const newGroups = nextGroups.filter((group) => !prevGroups.includes(group));
    recipients = await resolveEmailsFromGroups(newGroups);
  }

  if (nextVisibility === 'individual') {
    const prevIndividuals = prevVisibility === 'individual' ? normalizeStringArray(previousQuiz?.assignedIndividuals) : [];
    const nextIndividuals = normalizeStringArray(updatedQuiz.assignedIndividuals);
    const newIndividuals = nextIndividuals.filter((person) => !prevIndividuals.includes(person));
    recipients = await resolveEmailsFromIndividuals(newIndividuals);
  }

  if (recipients.length === 0) return;

  const dedup = new Map();
  recipients.forEach((recipient) => {
    if (!recipient?.email) return;
    const key = String(recipient.email).toLowerCase();
    if (!dedup.has(key)) dedup.set(key, recipient);
  });

  const actionUrl = `${process.env.FRONTEND_URL || 'https://finoqz.com'}/landing/user_dash/dashboard`;
  const visibilityLabel = nextVisibility === 'private'
    ? 'Private (Group Restricted)'
    : nextVisibility === 'individual'
      ? 'Direct Assignment'
      : 'Public';

  const jobs = Array.from(dedup.values()).map((recipient) => {
    const html = quizAssignmentTemplate({
      fullName: recipient.fullName,
      quizTitle: updatedQuiz.quizTitle,
      quizDescription: updatedQuiz.description,
      visibilityLabel,
      assignedVia: recipient.assignedVia,
      startAt: updatedQuiz.startAt,
      endAt: updatedQuiz.endAt,
      actionUrl,
    });

    return emailQueue.add('sendMail', {
      to: recipient.email,
      subject: `New Quiz Assigned: ${updatedQuiz.quizTitle || 'Quiz'}`,
      html,
    });
  });

  await Promise.allSettled(jobs);
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
  'assignedIndividuals',
  'tags',
  'difficultyLevel',
  'coverImage',
  'status',
  'saveAsDraft'
]);

// Create quiz
export const createQuiz = async (req, res) => {
  try {
    const {
      categoryId, quizTitle, description, duration, totalMarks,
      attemptLimit, shuffleQuestions,
      pricing, questions, visibility, groups, individuals,
      schedule, media, settings,
      postType, tags, difficultyLevel, saveAsDraft
    } = req.body;

    if (!quizTitle) {
      return res.status(400).json({ message: 'quizTitle is required' });
    }

    // Cover image upload (base64)
    let coverImageUrl = '';
    const banner = media?.banner;
    if (banner && banner.startsWith('data:')) {
      const uploadRes = await cloudinary.uploader.upload(banner, { folder: 'quiz-covers' });
      coverImageUrl = uploadRes.secure_url;
    } else if (banner) {
      coverImageUrl = banner;
    }

    // Dates
    const now = new Date();
    const isScheduled = postType === 'scheduled';
    let startAt = now;
    let endAt = new Date(now.getTime() + DEFAULT_LIVE_END_DAYS * 24 * 60 * 60 * 1000);

    if (isScheduled && schedule) {
      const s = parseDateTime(schedule.startDate, schedule.startTime);
      const e = parseDateTime(schedule.endDate, schedule.endTime);
      if (s) startAt = s;
      if (e) endAt = e;
    }

    const quiz = new Quiz({
      category: categoryId,
      quizTitle,
      description,
      duration: Number(duration || 0),
      totalMarks: Number(totalMarks || 0),
      numberOfQuestions: Array.isArray(questions) ? questions.length : 0,
      attemptLimit,
      shuffleQuestions: !!shuffleQuestions,
      pricingType: pricing?.type || 'free',
      price: pricing?.type === 'paid' ? Number(pricing?.amount || 0) : 0,
      offerCode: pricing?.offerCode || '',
      allowOfflinePayment: !!pricing?.allowOfflinePayment,
      startAt,
      endAt,
      visibility,
      assignedGroups: Array.isArray(groups) ? groups.map(String) : [],
      assignedIndividuals: Array.isArray(individuals) ? individuals.map(String) : [],
      tags: Array.isArray(tags) ? tags : [],
      difficultyLevel: difficultyLevel || 'medium',
      coverImage: coverImageUrl,
      showResults: settings?.showResults !== false,
      showCorrectAnswers: settings?.showCorrectAnswers !== false,
      status: saveAsDraft ? 'draft' : 'published',
      createdBy: req.adminId || req.userId || null,
    });

    await quiz.save();

    // Batch save questions if provided
    if (Array.isArray(questions) && questions.length > 0) {
      const questionDocs = questions.map(q => ({
        quizId: quiz._id,
        text: q.text,
        options: q.options,
        correct: q.correct,
        explanation: q.explanation || '',
        marks: 1, // Every question is exactly 1 mark
        createdBy: req.adminId || req.userId || null,
        status: 'accepted'
      }));
      
      const savedQuestions = await Question.insertMany(questionDocs);
      quiz.questions = savedQuestions.map(q => q._id);
      quiz.totalMarks = questions.length; // Automated total marks
      await quiz.save();
    }

    // Log quiz creation (admin only)
    if (req.adminId) {
      await QuizActivityLog.create({
        adminId: req.adminId,
        action: 'create_quiz',
        quizId: quiz._id,
        meta: { quizTitle, description },
        status: 'success',
        ip: req.ip,
        device: req.device || {},
        userAgent: req.headers['user-agent']
      });
    }

    return res.status(201).json({ message: "Quiz created successfully", data: quiz });
  } catch (err) {
    console.error("❌ createQuiz error:", err);
    return res.status(500).json({ message: err.message || "Server error creating quiz" });
  }
};

// AI description generator
export const generateDescriptionHandler = async (req, res) => {
  try {
    const { quizTitle } = req.body;
    if (!quizTitle) return res.status(400).json({ message: 'quizTitle required' });
    const result = await generateDescription(quizTitle);
    return res.json({ description: result });
  } catch (err) {
    return res.status(500).json({ message: 'AI description generation failed' });
  }
};

// Update quiz (partial, whitelisted)
export const updateQuiz = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ message: 'Invalid quiz id' });

    const previousQuiz = await Quiz.findById(id)
      .select('visibility assignedGroups assignedIndividuals quizTitle description startAt endAt')
      .lean();
    if (!previousQuiz) return res.status(404).json({ message: 'Quiz not found' });

    const incoming = { ...req.body };
    const update = {};

    // Support both create-style keys and edit-style keys.
    if (incoming.categoryId && !incoming.category) incoming.category = incoming.categoryId;
    if (Array.isArray(incoming.groups) && !Array.isArray(incoming.assignedGroups)) {
      incoming.assignedGroups = incoming.groups;
    }
    if (Array.isArray(incoming.individuals) && !Array.isArray(incoming.assignedIndividuals)) {
      incoming.assignedIndividuals = incoming.individuals;
    }

    // Accept UI aliases while persisting enum-compatible values.
    if (incoming.difficultyLevel === 'low') incoming.difficultyLevel = 'easy';
    if (incoming.difficultyLevel === 'high') incoming.difficultyLevel = 'hard';
    if (incoming.attemptLimit !== undefined) {
      incoming.attemptLimit = String(incoming.attemptLimit) === '1' ? '1' : 'unlimited';
    }

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
    if (update.assignedIndividuals && !Array.isArray(update.assignedIndividuals)) update.assignedIndividuals = [];
    if (Array.isArray(update.assignedGroups)) {
      update.assignedGroups = Array.from(new Set(update.assignedGroups.map((v) => String(v).trim()).filter(Boolean)));
    }
    if (Array.isArray(update.assignedIndividuals)) {
      update.assignedIndividuals = normalizeIndividualsArray(update.assignedIndividuals);
    }
    if (update.tags && !Array.isArray(update.tags)) update.tags = [];

    // Keep assignment state consistent by visibility.
    if (update.visibility === 'public' || update.visibility === 'unlisted') {
      update.assignedGroups = [];
      update.assignedIndividuals = [];
    }
    if (update.visibility === 'private') {
      update.assignedIndividuals = [];
    }
    if (update.visibility === 'individual') {
      update.assignedGroups = [];
    }

    const quiz = await Quiz.findByIdAndUpdate(id, update, { new: true, runValidators: true });
    if (!quiz) return res.status(404).json({ message: "Quiz not found" });

    try {
      await queueQuizAssignmentEmails({ previousQuiz, updatedQuiz: quiz });
    } catch (notifyErr) {
      console.error('Quiz assignment email queue error:', notifyErr);
    }

    // Log quiz update (admin only)
    if (req.adminId && id) {
      await QuizActivityLog.create({
        adminId: req.adminId,
        action: 'update_quiz',
        quizId: id,
        meta: { updates: req.body },
        status: 'success',
        ip: req.ip,
        device: req.device || {},
        userAgent: req.headers['user-agent']
      });
    }

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
export const setStatus = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ message: 'Invalid quiz id' });
    const { status } = req.body; // 'draft' | 'published'
    const quiz = await Quiz.findByIdAndUpdate(id, { status }, { new: true, runValidators: true });
    if (!quiz) return res.status(404).json({ message: "Quiz not found" });

    // Log status change (admin only)
    if (req.adminId && id) {
      await QuizActivityLog.create({
        adminId: req.adminId,
        action: status === 'published' ? 'publish_quiz' : 'unpublish_quiz',
        quizId: id,
        meta: { status },
        status: 'success',
        ip: req.ip,
        device: req.device || {},
        userAgent: req.headers['user-agent']
      });
    }

    return res.json({ message: "Status updated", data: quiz });
  } catch (err) {
    console.error("❌ setStatus error:", err);
    return res.status(500).json({ message: "Server error updating status" });
  }
};

// Admin list (with filters + pagination)
export const listAdmin = async (req, res) => {
  try {
    const { status, category, search, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (status) filter.status = status;
      // Log quiz update (admin only)
      if (req.adminId && req.params.id) {
        await QuizActivityLog.create({
          adminId: req.adminId,
          action: 'update_quiz',
          quizId: req.params.id,
          meta: { updates: req.body },
          status: 'success',
          ip: req.ip,
          device: req.device || {},
          userAgent: req.headers['user-agent']
        });
      }
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
export const listPublic = async (req, res) => {
  try {
    // Allow admin to fetch for any user via ?userId=...
    let userId = req.userId;
    if (req.adminId && req.query.userId) {
      userId = req.query.userId;
    }
    const user = await User.findById(userId).select('status email').lean();
    if (!user) return res.status(401).json({ message: 'User not found or not authenticated' });

    const { category, search, page = 1, limit = 20, upcoming } = req.query;
    const now = new Date();
    const userGroupTokens = await getUserGroupTokens(userId);
    const userEmail = normalizeEmail(req.email || user.email || '');
    const escapedEmail = escapeRegExp(userEmail);
    const visibilityFilter = [
      { visibility: 'public' },
      {
        visibility: 'individual',
        $or: [
          { assignedIndividuals: String(userId) },
          ...(userEmail
            ? [{ assignedIndividuals: { $regex: `^${escapedEmail}$`, $options: 'i' } }]
            : []),
        ],
      }
    ];
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
export const getById = async (req, res) => {
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

    if (quiz.visibility === 'private' || quiz.visibility === 'individual') {
      const userGroupTokens = await getUserGroupTokens(req.userId);
      const userEmail = normalizeEmail(req.email || user.email || '');
      const assignedGroups = Array.isArray(quiz.assignedGroups) ? quiz.assignedGroups.map(String) : [];
      const assignedIndivs = Array.isArray(quiz.assignedIndividuals) ? quiz.assignedIndividuals.map(String) : [];
      const normalizedAssignedIndivs = assignedIndivs.map((value) => (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? normalizeEmail(value) : String(value).trim()));
      
      const inGroups = assignedGroups.some(g => userGroupTokens.includes(String(g)));
      const inIndivs = normalizedAssignedIndivs.includes(String(req.userId)) || (userEmail && normalizedAssignedIndivs.includes(userEmail));
      
      const hasAccess = quiz.visibility === 'private' ? inGroups : inIndivs;
      if (!hasAccess) {
        return res.status(403).json({ message: 'Access denied' });
      }
    }
    return res.json({ data: quiz });
  } catch (err) {
    console.error("❌ getById error:", err);
    return res.status(500).json({ message: "Server error fetching quiz" });
  }
};

// Admin get by id (no visibility/time restrictions)
export const getAdminById = async (req, res) => {
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
export const deleteQuiz = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ message: 'Invalid quiz id' });
    const del = await Quiz.findByIdAndDelete(id);
    if (!del) return res.status(404).json({ message: "Quiz not found" });

    // Log quiz deletion (admin only)
    if (req.adminId && id) {
      await QuizActivityLog.create({
        adminId: req.adminId,
        action: 'delete_quiz',
        quizId: id,
        meta: {},
        status: 'success',
        ip: req.ip,
        device: req.device || {},
        userAgent: req.headers['user-agent']
      });
    }

    return res.json({ message: "Quiz deleted" });
  } catch (err) {
    console.error("❌ deleteQuiz error:", err);
    return res.status(500).json({ message: "Server error deleting quiz" });
  }
};

// Enroll (increment enrolledCount) — user panel action
export const enroll = async (req, res) => {
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

    if (quiz.visibility === 'private' || quiz.visibility === 'individual') {
      const userGroupTokens = await getUserGroupTokens(req.userId);
      const userEmail = normalizeEmail(req.email || user.email || '');
      const assignedGroups = Array.isArray(quiz.assignedGroups) ? quiz.assignedGroups.map(String) : [];
      const assignedIndivs = Array.isArray(quiz.assignedIndividuals) ? quiz.assignedIndividuals.map(String) : [];
      const normalizedAssignedIndivs = assignedIndivs.map((value) => (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? normalizeEmail(value) : String(value).trim()));
      
      const inGroups = assignedGroups.some(g => userGroupTokens.includes(String(g)));
      const inIndivs = normalizedAssignedIndivs.includes(String(req.userId)) || (userEmail && normalizedAssignedIndivs.includes(userEmail));
      
      const hasAccess = quiz.visibility === 'private' ? inGroups : inIndivs;
      if (!hasAccess) {
        return res.status(403).json({ message: 'Access denied' });
      }
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

    const isPaidQuiz = quiz.pricingType === 'paid' && Number(quiz.price || 0) > 0;

    if (!existingPurchase && !existingAttempt && isPaidQuiz) {
      return res.status(400).json({ message: 'Payment required to enroll' });
    }

    let purchaseForEnroll = existingPurchase;
    if (!purchaseForEnroll && !isPaidQuiz) {
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
      return res.json({
        message: 'Already enrolled',
        enrolledCount: quiz.enrolledCount || 0,
        participantCount: quiz.participantCount || 0,
      });
    }

    const updated = await Quiz.findByIdAndUpdate(
      id,
      { $inc: { enrolledCount: 1 } },
      { new: true }
    );
    if (!updated) return res.status(404).json({ message: "Quiz not found" });

    if (purchaseForEnroll) {
      purchaseForEnroll.metadata = { ...(purchaseForEnroll.metadata || {}), enrolled: true };
      await purchaseForEnroll.save();
    }
    return res.json({
      message: "Enrolled",
      enrolledCount: updated.enrolledCount,
      participantCount: updated.participantCount,
    });
  } catch (err) {
    console.error("❌ enroll error:", err);
    return res.status(500).json({ message: "Server error enrolling" });
  }
};

// Generate questions from prompt
export const generateQuestions = async (req, res) => {
  try {
    const { prompt, numQuestions, topic, context } = req.body;
    const result = await generateFromPrompt(prompt, numQuestions, topic, context);
    // Normalize for frontend
    const normalized = Array.isArray(result.questions)
      ? result.questions.map(q => ({
          text: String(q.text || '').trim(),
          options: Array.isArray(q.options) ? q.options.map(String) : ['', '', '', ''],
          correct: typeof q.correct === 'number' ? q.correct : 0,
          explanation: q.explanation ? String(q.explanation) : '',
          marks: 1
        })).filter(q => q.text)
      : [];
    return res.json({ data: normalized });
  } catch (err) {
    return res.status(500).json({ message: 'AI question generation failed' });
  }
};

// Get quiz preview (2-3 sample questions for paid quizzes)
export const getQuizPreview = async (req, res) => {
  try {
    const { quizId } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(quizId)) {
      return res.status(400).json({ message: 'Invalid quiz ID' });
    }

    // Log status change (admin only)
    if (req.adminId && req.params.id) {
      await QuizActivityLog.create({
        adminId: req.adminId,
        action: req.body.status === 'published' ? 'publish_quiz' : 'unpublish_quiz',
        quizId: req.params.id,
        meta: { status: req.body.status },
        status: 'success',
        ip: req.ip,
        device: req.device || {},
        userAgent: req.headers['user-agent']
      });
    }
    const quiz = await Quiz.findById(quizId)
      .select('quizTitle description duration totalMarks pricingType price difficultyLevel category questions attemptLimit')
      .lean();

    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    let questionIds = Array.isArray(quiz.questions) ? quiz.questions.map(String) : [];

    let questions = questionIds.length > 0
      ? await Question.find({ _id: { $in: questionIds } })
          .select('text options type marks correct explanation')
          .lean()
      : [];

    if (questionIds.length === 0) {
      questions = await Question.find({ quizId })
        .select('text options type marks correct explanation')
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
    let orderedQuestions = questionIds
      .map(id => questionMap.get(id))
      .filter(Boolean);

    // Remove correct answer information
    // If all questions have marks=1 but quiz.totalMarks and question count > 0, calculate marks per question
    let marksToShow = 1;
    if (
      quiz.totalMarks &&
      orderedQuestions.length > 0 &&
      orderedQuestions.every(q => !q.marks || q.marks === 1)
    ) {
      marksToShow = Math.round(quiz.totalMarks / orderedQuestions.length);
      // Log quiz deletion (admin only)
      if (req.adminId && req.params.id) {
        await QuizActivityLog.create({
          adminId: req.adminId,
          action: 'delete_quiz',
          quizId: req.params.id,
          meta: {},
          status: 'success',
          ip: req.ip,
          device: req.device || {},
          userAgent: req.headers['user-agent']
        });
      }
    }

    // Limit to 2 questions and remove correct/explanation for preview
    const previewQuestions = orderedQuestions.slice(0, 2).map(q => ({
      id: String(q._id),
      text: q.text,
      options: q.options || [],
      type: q.type || 'mcq',
      marks: (q.marks && q.marks > 1) ? q.marks : marksToShow,
      // Stripping correct and explanation to prevent cheating in preview
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
        attemptLimit: quiz.attemptLimit === 'unlimited' ? 'unlimited' : '1',
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
export const getQuizQuestions = async (req, res) => {
  try {
    const user = await ensureActiveUser(req, res);
    if (!user) return;

    const quizId = req.params.quizId || req.params.id;
    if (!mongoose.Types.ObjectId.isValid(quizId)) {
      return res.status(400).json({ message: 'Invalid quiz ID' });
    }

    const quiz = await Quiz.findById(quizId)
      .select('status startAt endAt visibility assignedGroups assignedIndividuals questions shuffleQuestions numberOfQuestions')
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

    if (quiz.visibility === 'private' || quiz.visibility === 'individual') {
      const userGroupTokens = await getUserGroupTokens(req.userId);
      const user = await User.findById(req.userId).select('email').lean();
      const userEmail = String(req.email || user?.email || '').trim().toLowerCase();
      const assignedGroups = Array.isArray(quiz.assignedGroups) ? quiz.assignedGroups.map(String) : [];
      const assignedIndivs = Array.isArray(quiz.assignedIndividuals) ? quiz.assignedIndividuals.map(String) : [];
      const normalizedAssignedIndivs = assignedIndivs.map((value) => {
        const trimmed = String(value).trim();
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed) ? trimmed.toLowerCase() : trimmed;
      });
      
      const inGroups = assignedGroups.some(g => userGroupTokens.includes(String(g)));
      const inIndivs = normalizedAssignedIndivs.includes(String(req.userId)) || (userEmail && normalizedAssignedIndivs.includes(userEmail));
      const hasAccess = quiz.visibility === 'private' ? inGroups : inIndivs;

      if (!hasAccess) {
        return res.status(403).json({ message: 'Access denied' });
      }
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
export const getMyQuizzes = async (req, res) => {
  try {
    // Allow admin to fetch for any user via ?userId=...
    let userId = req.userId;
    if (req.adminId && req.query.userId) {
      userId = req.query.userId;
    }
    if (!userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    // Get purchased quizzes from transactions
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
    const attempts = await QuizAttempt.find({ userId })
      .select('quizId status totalScore percentage submittedAt attemptNumber createdAt')
      .sort({ createdAt: -1 })
      .lean();

    const attemptedQuizIds = [...new Set(attempts.map(a => String(a.quizId)))];
    
    // Combine all quiz IDs
    const allQuizIds = [...new Set([...purchasedQuizIds, ...attemptedQuizIds])];

    // Get quiz details
    const quizzes = await Quiz.find({ _id: { $in: allQuizIds } })
      .select('quizTitle description duration totalMarks pricingType price category difficultyLevel coverImage status attemptLimit')
      .lean();

    // Group attempts by quiz once to avoid repeated filtering and ensure accurate per-quiz state.
    const attemptsByQuizId = attempts.reduce((acc, attempt) => {
      const key = String(attempt.quizId);
      if (!acc[key]) acc[key] = [];
      acc[key].push(attempt);
      return acc;
    }, {});

    // Enrich with attempt information
    const enrichedQuizzes = quizzes.map(quiz => {
      const quizKey = String(quiz._id);
      const quizAttempts = Array.isArray(attemptsByQuizId[quizKey]) ? attemptsByQuizId[quizKey] : [];
      const isPurchased = purchasedQuizIds.includes(quizKey);

      let attemptStatus = 'not-started';
      let bestScore = null;
      let latestAttempt = null;

      if (quizAttempts.length > 0) {
        const latestByCreated = quizAttempts[0];
        const completedAttempts = quizAttempts.filter(a => a.status === 'submitted');

        if (latestByCreated?.status === 'in_progress') {
          attemptStatus = 'in-progress';
        } else if (completedAttempts.length > 0) {
          attemptStatus = 'completed';
          bestScore = Math.max(...completedAttempts.map(a => a.percentage || 0));
          latestAttempt = completedAttempts[0];
        }
      }

      return {
        ...quiz,
        isPurchased,
        attemptStatus,
        bestScore,
        totalAttempts: quizAttempts.length,
        latestAttempt: latestAttempt ? {
          _id: latestAttempt._id,
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