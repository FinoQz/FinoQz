import express from 'express';
import * as controller from '../controllers/demoQuizController.js';
import verifyToken from '../middlewares/verifyToken.js';
import requireAdmin from '../middlewares/requireAdmin.js';

const router = express.Router();

// 🔐 Admin Routes (Protected)
router.get('/categories', verifyToken(), requireAdmin, controller.getCategories);
router.post('/categories', verifyToken(), requireAdmin, controller.createCategory);
router.put('/categories/:id', verifyToken(), requireAdmin, controller.updateCategory);
router.delete('/categories/:id', verifyToken(), requireAdmin, controller.deleteCategory);

router.get('/subcategories', verifyToken(), requireAdmin, controller.getSubcategories);
router.post('/subcategories', verifyToken(), requireAdmin, controller.createSubcategory);
router.put('/subcategories/:id', verifyToken(), requireAdmin, controller.updateSubcategory);
router.delete('/subcategories/:id', verifyToken(), requireAdmin, controller.deleteSubcategory);

router.get('/questions', verifyToken(), requireAdmin, controller.getQuestions);
router.post('/questions', verifyToken(), requireAdmin, controller.createQuestion);
router.put('/questions/:id', verifyToken(), requireAdmin, controller.updateQuestion);
router.delete('/questions/:id', verifyToken(), requireAdmin, controller.deleteQuestion);

// File Upload for Questions
router.post('/upload-file', verifyToken(), requireAdmin, controller.uploadQuestionsFile);

router.post('/ai-generate', verifyToken(), requireAdmin, controller.generateAIQuestions);

// 🌐 Public Routes for Landing Page (No Auth Required)
router.get('/public/categories', controller.getPublicCategories);
router.get('/public/quiz', controller.getPublicQuizBySubcategory);

export default router;
