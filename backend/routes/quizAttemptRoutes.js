const express = require('express');
const router = express.Router();
const {
  startAttempt,
  saveAnswer,
  submitAttempt,
  getAttemptDetails,
  getUserAttempts,
  getAttemptsByQuiz
} = require('../controllers/quizAttemptController');
const { celebrate, Joi, Segments } = require('celebrate');

// Middleware to verify JWT token
const verifyToken = require('../middlewares/verifyToken');
const requireAdmin = require('../middlewares/requireAdmin');

// Start a new quiz attempt
router.post('/start',
  verifyToken(),
  celebrate({
    [Segments.BODY]: Joi.object({
      quizId: Joi.string().required()
    })
  }),
  startAttempt
);

// Save an answer
router.post('/:attemptId/answer',
  verifyToken(),
  celebrate({
    [Segments.PARAMS]: Joi.object({
      attemptId: Joi.string().required()
    }),
    [Segments.BODY]: Joi.object({
      questionId: Joi.string().required(),
      selectedAnswer: Joi.alternatives().try(Joi.string(), Joi.array()).required(),
      timeSpent: Joi.number().optional()
    })
  }),
  saveAnswer
);

// Submit quiz attempt
router.post('/:attemptId/submit',
  verifyToken(),
  celebrate({
    [Segments.PARAMS]: Joi.object({
      attemptId: Joi.string().required()
    })
  }),
  submitAttempt
);

// Get specific attempt details
router.get('/:attemptId',
  verifyToken(),
  celebrate({
    [Segments.PARAMS]: Joi.object({
      attemptId: Joi.string().required()
    })
  }),
  getAttemptDetails
);

// Get user's all attempts
router.get('/user/all',
  verifyToken(),
  getUserAttempts
);

// Get all attempts for a quiz (Admin only)
router.get('/quiz/:quizId',
  verifyToken(),
  requireAdmin,
  celebrate({
    [Segments.PARAMS]: Joi.object({
      quizId: Joi.string().required()
    })
  }),
  getAttemptsByQuiz
);

module.exports = router;
