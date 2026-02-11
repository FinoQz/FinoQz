const express = require('express');
const router = express.Router();

const {
  getInsights,
  getInsightById,
  createInsight,
  editInsight,
  likeInsight,
  addComment,
  shareInsight,
  likeComment,
  deleteInsight,
  deleteComment,
  getPinnedInsights
} = require('../controllers/insightController');

const {
  getAllInsights,
  getInsightsAnalytics,
  createAdminInsight,
  togglePinInsight,
  toggleInsightStatus,
  deleteAnyInsight
} = require('../controllers/adminInsightController');

const auth = require('../middlewares/authMiddleware');
const admin = require('../middlewares/adminAuth');

// Public routes
router.get('/pinned', getPinnedInsights);

// Authenticated user routes
router.get('/', auth, getInsights);
router.get('/:id', auth, getInsightById);
router.post('/', auth, createInsight);
router.put('/:id', auth, editInsight);
router.post('/:id/like', auth, likeInsight);
router.post('/:id/comment', auth, addComment);
router.post('/:id/share', auth, shareInsight);
router.post('/comments/:commentId/like', auth, likeComment);
router.delete('/:id', auth, deleteInsight);
router.delete('/comments/:commentId', auth, deleteComment);

// Admin routes
router.get('/admin/all', auth, admin, getAllInsights);
router.get('/admin/analytics', auth, admin, getInsightsAnalytics);
router.post('/admin/create', auth, admin, createAdminInsight);
router.patch('/admin/:id/pin', auth, admin, togglePinInsight);
router.patch('/admin/:id/status', auth, admin, toggleInsightStatus);
router.delete('/admin/:id', auth, admin, deleteAnyInsight);

module.exports = router;
