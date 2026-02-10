const express = require('express');
const router = express.Router();
const {
  getDashboardStats,
  getUserGrowth,
  getQuizStats,
  getRevenueAnalytics,
  getTopPerformers,
  getCategoryPerformance,
  getQuestionInsights
} = require('../controllers/analyticsController');
const verifyToken = require('../middlewares/verifyToken');
const requireAdmin = require('../middlewares/requireAdmin');

// All analytics routes require admin access
router.use(verifyToken(), requireAdmin);

// Get dashboard KPI stats
router.get('/dashboard-stats', getDashboardStats);

// Get user growth data
router.get('/user-growth', getUserGrowth);

// Get quiz performance statistics
router.get('/quiz-stats', getQuizStats);

// Get revenue analytics
router.get('/revenue', getRevenueAnalytics);

// Get top performers
router.get('/top-performers', getTopPerformers);

// Get category performance
router.get('/category-performance', getCategoryPerformance);

// Get question-level insights
router.get('/question-insights', getQuestionInsights);

module.exports = router;
