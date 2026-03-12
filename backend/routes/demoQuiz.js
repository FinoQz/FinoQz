import express from 'express';
import * as controller from '../controllers/demoQuizController.js';

const router = express.Router();

// 🔐 Admin Routes
router.get('/categories', controller.getCategories);
router.post('/categories', controller.createCategory);

router.get('/questions', controller.getQuestions);
router.post('/questions', controller.createQuestion);
router.delete('/questions/:id', controller.deleteQuestion);

router.post('/ai-generate', controller.generateAIQuestions);

// 🌐 Public Routes for Landing Page
router.get('/public/categories', controller.getPublicCategories);
router.get('/public/quiz', controller.getPublicQuizByCategory);

export default router;
