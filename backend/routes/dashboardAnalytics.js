import express from 'express';
import * as ctrl from '../controllers/dashboardAnalyticsController.js';

const router = express.Router();

router.get('/daily-revenue', ctrl.getDailyRevenue);
router.get('/quiz-completion', ctrl.getQuizCompletion);
router.get('/category-participation', ctrl.getCategoryParticipation);
// For dashboard card (global top users)
router.get('/top-users', ctrl.getTopUsersCardData);
router.get('/upcoming-quizzes', ctrl.getUpcomingQuizzes);
router.get('/recent-admin-actions', ctrl.getRecentQuizAdminActions);
router.get('/active-quizzes', ctrl.getActiveQuizzes);
router.get('/today-revenue', ctrl.getTodayRevenue);
router.get('/quiz-admin-dashboard', ctrl.getQuizAdminDashboard);

export default router;
