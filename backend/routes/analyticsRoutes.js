import express from 'express';
import {
  getDashboardStats,
  getUserGrowth,
  getQuizStats,
  getRevenueAnalytics,
  getTopPerformers,
  getCategoryPerformance,
  getQuestionInsights,
  getQuizPaidUsers,
  getQuizRevenue
} from '../controllers/analyticsController.js';
import verifyToken from '../middlewares/verifyToken.js';
import requireAdmin from '../middlewares/requireAdmin.js';

const router = express.Router();

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

// Get paid users count for a quiz
router.get('/quiz-paid-users', getQuizPaidUsers);

// Get total revenue for a quiz
router.get('/quiz-revenue', getQuizRevenue);

export default router;
