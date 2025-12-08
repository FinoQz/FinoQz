// routes/questionRoutes.js
const express = require('express');
const router = express.Router();
const questionC = require('../controllers/questionController');
const authMiddleware = require('../middlewares/authMiddleware');

// Create single question (optionally attach to quiz via path)
router.post('/quizzes/:quizId/questions', authMiddleware('admin'), questionC.bulkCreateAndAttach);

// Create a question independent of quiz
router.post('/questions', authMiddleware('admin'), questionC.createQuestion);

// CRUD for individual questions
router.get('/questions/:id', authMiddleware('admin'), questionC.getQuestion);
router.put('/questions/:id', authMiddleware('admin'), questionC.updateQuestion);
router.delete('/questions/:id', authMiddleware('admin'), questionC.deleteQuestion);

module.exports = router;