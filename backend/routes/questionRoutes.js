import express from 'express';
import * as questionC from '../controllers/questionController.js';
import authMiddleware from '../middlewares/authMiddleware.js';

const router = express.Router();

// Create single question (optionally attach to quiz via path)
router.post('/quizzes/:quizId/questions', authMiddleware('admin'), questionC.bulkCreateAndAttach);

// Create a question independent of quiz
router.post('/questions', authMiddleware('admin'), questionC.createQuestion);

// CRUD for individual questions
router.get('/questions/:id', authMiddleware('admin'), questionC.getQuestion);
router.put('/questions/:id', authMiddleware('admin'), questionC.updateQuestion);
router.delete('/questions/:id', authMiddleware('admin'), questionC.deleteQuestion);

export default router;