const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/dashboardAnalyticsController');

router.get('/daily-revenue', ctrl.getDailyRevenue);
router.get('/quiz-completion', ctrl.getQuizCompletion);
router.get('/category-participation', ctrl.getCategoryParticipation);
router.get('/top-users', ctrl.getTopUsers);
router.get('/upcoming-quizzes', ctrl.getUpcomingQuizzes);
router.get('/recent-admin-actions', ctrl.getRecentAdminActions);
router.get('/today-revenue', ctrl.getTodayRevenue);
router.get('/quiz-admin-dashboard', ctrl.getQuizAdminDashboard);

module.exports = router;
