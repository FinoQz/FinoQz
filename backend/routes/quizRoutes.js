// routes/quizRoutes.js
const express = require('express');
const rateLimit = require('express-rate-limit');
const { celebrate, Joi, errors } = require('celebrate');
const adminAuth = require('../middlewares/adminAuth');
const c = require('../controllers/quizController');

const router = express.Router();

const createSchema = celebrate({
  body: Joi.object({
    category: Joi.string().required(),
    pricingType: Joi.string().valid('free', 'paid').required(),
    price: Joi.when('pricingType', {
      is: 'paid',
      then: Joi.number().min(1).required(),
      otherwise: Joi.number().default(0)
    }),
    couponCode: Joi.string().allow(''),
    allowOfflinePayment: Joi.boolean(),

    quizTitle: Joi.string().min(3).required(),
    description: Joi.string().min(10).required(),
    duration: Joi.number().min(1).required(),
    totalMarks: Joi.number().min(1).required(),
    attemptLimit: Joi.string().valid('unlimited', '1').required(),
    shuffleQuestions: Joi.boolean(),
    negativeMarking: Joi.boolean(),
    negativePerWrong: Joi.number().min(0),

    startDate: Joi.string().required(),
    startTime: Joi.string().required(),
    endDate: Joi.string().required(),
    endTime: Joi.string().required(),

    visibility: Joi.string().valid('public','unlisted','private').required(),
    assignedGroups: Joi.array().items(Joi.string()).default([]),

    coverImage: Joi.string().allow(''),
    tags: Joi.array().items(Joi.string()).default([]),
    difficultyLevel: Joi.string().valid('easy','medium','hard').required(),

    saveAsDraft: Joi.boolean().default(false),
  })
});

const updateSchema = celebrate({
  body: Joi.object({
    category: Joi.string(),
    quizTitle: Joi.string(),
    description: Joi.string(),
    duration: Joi.number(),
    totalMarks: Joi.number(),
    attemptLimit: Joi.string().valid('unlimited', '1'),
    shuffleQuestions: Joi.boolean(),
    negativeMarking: Joi.boolean(),
    negativePerWrong: Joi.number(),
    pricingType: Joi.string().valid('free', 'paid'),
    price: Joi.number(),
    couponCode: Joi.string().allow(''),
    allowOfflinePayment: Joi.boolean(),
    startDate: Joi.string(),
    startTime: Joi.string(),
    endDate: Joi.string(),
    endTime: Joi.string(),
    visibility: Joi.string().valid('public','unlisted','private'),
    assignedGroups: Joi.array().items(Joi.string()),
    coverImage: Joi.string().allow(''),
    tags: Joi.array().items(Joi.string()),
    difficultyLevel: Joi.string().valid('easy','medium','hard'),
    status: Joi.string().valid('draft','published'),
  })
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
router.get('/admin/quizzes/:id', adminAuth, c.getById);
router.put('/admin/quizzes/:id', adminAuth, writeLimiter, updateSchema, c.updateQuiz);
router.post('/admin/quizzes/:id/status', adminAuth, writeLimiter, statusSchema, c.setStatus);
router.delete('/admin/quizzes/:id', adminAuth, writeLimiter, c.deleteQuiz);

// Public routes (user panel)
router.get('/quizzes', listLimiter, c.listPublic);
router.get('/quizzes/:id', c.getById);
router.post('/quizzes/:id/enroll', writeLimiter, c.enroll);

// Celebrate error handler
router.use(errors());

module.exports = router;
