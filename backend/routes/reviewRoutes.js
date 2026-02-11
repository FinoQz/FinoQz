const express = require('express');
const router = express.Router();

const {
  createReview,
  getPinnedReviews,
  getAllReviews,
  togglePinReview,
  toggleApproveReview,
  deleteReview
} = require('../controllers/reviewController');

const verifyToken = require('../middlewares/verifyToken');
const requireAdmin = require('../middlewares/requireAdmin');

// Public routes
router.post('/', createReview);
router.get('/pinned', getPinnedReviews);

// Admin routes
router.get('/admin/all', verifyToken(), requireAdmin, getAllReviews);
router.patch('/admin/:id/pin', verifyToken(), requireAdmin, togglePinReview);
router.patch('/admin/:id/approve', verifyToken(), requireAdmin, toggleApproveReview);
router.delete('/admin/:id', verifyToken(), requireAdmin, deleteReview);

module.exports = router;