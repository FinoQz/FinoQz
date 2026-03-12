
import express from 'express';
import {
  startAttempt,
  saveAnswer,
  submitAttempt,
  getAttemptDetails,
  getUserAttempts,
  getAttemptsByQuiz,
  getAttemptResult
} from '../controllers/quizAttemptController.js';
import { celebrate, Joi, Segments } from 'celebrate';
import verifyToken from '../middlewares/verifyToken.js';
import requireAdmin from '../middlewares/requireAdmin.js';

const router = express.Router();

// Get all attempts (Admin only, for reports/analytics)

import { getAllAttempts } from '../controllers/quizAttemptController.js';
router.get('/all',
  verifyToken(),
  requireAdmin,
  getAllAttempts
);

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

// Get detailed result for an attempt
router.get('/:attemptId/result',
  verifyToken(),
  celebrate({
    [Segments.PARAMS]: Joi.object({
      attemptId: Joi.string().required()
    })
  }),
  getAttemptResult
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

export default router;
