const express = require('express');
const router = express.Router();
const controller = require('../controllers/demoQuizController');

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

module.exports = router;
