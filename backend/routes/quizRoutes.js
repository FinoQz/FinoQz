
import express from 'express';
import rateLimit from 'express-rate-limit';
import { celebrate, Joi, errors } from 'celebrate';
import adminAuth from '../middlewares/adminAuth.js';
import authMiddleware from '../middlewares/authMiddleware.js';
import * as c from '../controllers/quizController.js';

const router = express.Router();

const createSchema = celebrate({
  body: Joi.object({
    categoryId: Joi.string().required(),
    quizTitle: Joi.string().min(1).required(),
    description: Joi.string().allow('', null),
    duration: Joi.number().min(0).default(30),
    totalMarks: Joi.number().min(0).optional(),
    attemptLimit: Joi.string().valid('unlimited', '1', '2', '3', '4', '5').default('unlimited'),
    shuffleQuestions: Joi.boolean(),

    pricing: Joi.object({
      type: Joi.string().valid('free', 'paid').required(),
      amount: Joi.number().min(0).default(0),
      offerCode: Joi.string().allow(''),
      allowOfflinePayment: Joi.boolean(),
    }).required(),

    questions: Joi.array().items(Joi.object({
      text: Joi.string().allow('', null).required(),
      options: Joi.array().items(Joi.string().allow('', null)).min(1).required(),
      correct: Joi.number().allow(null).default(0),
      explanation: Joi.string().allow('', null)
    }).options({ allowUnknown: true })).default([]),

    visibility: Joi.string().valid('public', 'unlisted', 'private', 'individual').required(),
    groups: Joi.array().items(Joi.string()).default([]),
    individuals: Joi.array().items(Joi.string()).default([]),

    schedule: Joi.object({
      startDate: Joi.string().allow(''),
      startTime: Joi.string().allow(''),
      endDate: Joi.string().allow(''),
      endTime: Joi.string().allow(''),
    }).allow(null),

    media: Joi.object({
      banner: Joi.string().allow(null, ''),
      featured: Joi.string().allow(null, ''),
    }),

    settings: Joi.object({
      showResults: Joi.boolean().default(true),
      showCorrectAnswers: Joi.boolean().default(true),
      certificateEnabled: Joi.boolean().default(false),
    }),

    postType: Joi.string().valid('live', 'scheduled').default('live'),
    tags: Joi.array().items(Joi.string()).default([]),
    difficultyLevel: Joi.string().valid('easy', 'medium', 'hard').default('medium'),
    saveAsDraft: Joi.boolean().default(false),
  }).options({ allowUnknown: true })
});

const updateSchema = celebrate({
  body: Joi.object({
    categoryId: Joi.string().allow('', null),
    category: Joi.string().allow('', null),
    quizTitle: Joi.string().allow('', null),
    description: Joi.string().allow('', null),
    duration: Joi.number().min(0),
    totalMarks: Joi.number().min(0).optional(),
    attemptLimit: Joi.string().valid('unlimited', '1'),
    shuffleQuestions: Joi.boolean(),
    pricing: Joi.object({
      type: Joi.string().valid('free', 'paid'),
      amount: Joi.number(),
      offerCode: Joi.string().allow(''),
      allowOfflinePayment: Joi.boolean(),
    }),
    visibility: Joi.string().valid('public', 'unlisted', 'private', 'individual'),
    groups: Joi.array().items(Joi.string()),
    individuals: Joi.array().items(Joi.string()),
    assignedGroups: Joi.array().items(Joi.string()),
    assignedIndividuals: Joi.array().items(Joi.string()),
    media: Joi.object({
      banner: Joi.string().allow(null, ''),
      featured: Joi.string().allow(null, ''),
    }),
    settings: Joi.object({
      showResults: Joi.boolean(),
      showCorrectAnswers: Joi.boolean(),
      certificateEnabled: Joi.boolean(),
    }),
    status: Joi.string().valid('draft', 'published', 'scheduled'),
    tags: Joi.array().items(Joi.string()),
    difficultyLevel: Joi.string().valid('easy', 'medium', 'hard', 'low', 'high'),
  }).options({ allowUnknown: true })
});

const statusSchema = celebrate({
  body: Joi.object({ status: Joi.string().valid('draft','published').required() })
});

const listLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false
});

const writeLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false
});

// Admin routes
router.post('/admin/quizzes', adminAuth, writeLimiter, createSchema, c.createQuiz);
router.get('/admin/quizzes', adminAuth, listLimiter, c.listAdmin);
router.get('/admin/quizzes/:id', adminAuth, c.getAdminById);
router.put('/admin/quizzes/:id', adminAuth, writeLimiter, updateSchema, c.updateQuiz);
router.post('/admin/quizzes/:id/status', adminAuth, writeLimiter, statusSchema, c.setStatus);
router.delete('/admin/quizzes/:id', adminAuth, writeLimiter, c.deleteQuiz);

// AI description generator
router.post('/admin/generate-description', adminAuth, celebrate({
  body: Joi.object({ quizTitle: Joi.string().min(3).required() })
}), c.generateDescriptionHandler);

// AI quiz question generator
router.post('/admin/generate-questions', adminAuth, c.generateQuestions);

// Public routes (user panel)
router.get('/quizzes', authMiddleware(), listLimiter, c.listPublic);
router.get('/quizzes/:id', authMiddleware(), c.getById);
router.get('/:quizId/questions', authMiddleware(), c.getQuizQuestions);
router.get('/quizzes/:quizId/questions', authMiddleware(), c.getQuizQuestions);
router.get('/:quizId/preview', authMiddleware(), c.getQuizPreview);
router.get('/quizzes/:quizId/preview', authMiddleware(), c.getQuizPreview);
router.get('/my-quizzes', authMiddleware(), c.getMyQuizzes);
router.post('/quizzes/:id/enroll', authMiddleware(), writeLimiter, c.enroll);
router.post('/:id/enroll', authMiddleware(), writeLimiter, c.enroll);

// Celebrate error handler with console logging for debugging
router.use((err, req, res, next) => {
  if (err.joi) {
    console.error('❌ Joi Validation Error:', err.joi.details);
  }
  next(err);
});

router.use(errors());

export default router;
