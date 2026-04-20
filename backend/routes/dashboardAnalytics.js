import express from 'express';
import * as ctrl from '../controllers/dashboardAnalyticsController.js';
import authMiddleware from '../middlewares/authMiddleware.js';
import requireAdmin from '../middlewares/requireAdmin.js';

const router = express.Router();

// ✅ All analytics routes are for admins only
router.use(authMiddleware('admin'), requireAdmin);

router.get('/daily-revenue', ctrl.getDailyRevenue);
router.get('/quiz-completion', ctrl.getQuizCompletion);
router.get('/category-participation', ctrl.getCategoryParticipation);
router.get('/top-users', ctrl.getTopUsersCardData);
router.get('/upcoming-quizzes', ctrl.getUpcomingQuizzes);
router.get('/recent-admin-actions', ctrl.getRecentQuizAdminActions);
router.get('/active-quizzes', ctrl.getActiveQuizzes);
router.get('/today-revenue', ctrl.getTodayRevenue);
router.get('/quiz-admin-dashboard', ctrl.getQuizAdminDashboard);

// ✅ NEW Implementation Endpoints
router.get('/conversion-funnel', ctrl.getConversionFunnel);
router.get('/private-groups', ctrl.getPrivateGroupsHealth);
router.get('/platform-pulse', ctrl.getPlatformPulse);
router.get('/user-growth', ctrl.getUserGrowthData);
router.get('/live-users', ctrl.getLiveUsers);
router.get('/dashboard-stats', ctrl.getDashboardStats);
router.get('/monthly-users', ctrl.getMonthlyUsers);

export default router;
