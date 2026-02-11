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


const verifyToken = require('../middlewares/verifyToken');
const requireAdmin = require('../middlewares/requireAdmin');

// Public routes
router.get('/pinned', getPinnedInsights);

// Authenticated user routes
router.get('/', verifyToken(), getInsights);
router.get('/:id', verifyToken(), getInsightById);
router.post('/', verifyToken(), createInsight);
router.put('/:id', verifyToken(), editInsight);
router.post('/:id/like', verifyToken(), likeInsight);
router.post('/:id/comment', verifyToken(), addComment);
router.post('/:id/share', verifyToken(), shareInsight);
router.post('/comments/:commentId/like', verifyToken(), likeComment);
router.delete('/:id', verifyToken(), deleteInsight);
router.delete('/comments/:commentId', verifyToken(), deleteComment);

// Admin routes
router.get('/admin/all', verifyToken(), requireAdmin, getAllInsights);
router.get('/admin/analytics', verifyToken(), requireAdmin, getInsightsAnalytics);
router.post('/admin/create', verifyToken(), requireAdmin, createAdminInsight);
router.patch('/admin/:id/pin', verifyToken(), requireAdmin, togglePinInsight);
router.patch('/admin/:id/status', verifyToken(), requireAdmin, toggleInsightStatus);
router.delete('/admin/:id', verifyToken(), requireAdmin, deleteAnyInsight);

module.exports = router;
