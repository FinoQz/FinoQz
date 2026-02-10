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

const auth = require('../middlewares/authMiddleware');
const admin = require('../middlewares/adminAuth');

// Public routes
router.post('/', createReview);
router.get('/pinned', getPinnedReviews);

// Admin routes
router.get('/admin/all', auth, admin, getAllReviews);
router.patch('/admin/:id/pin', auth, admin, togglePinReview);
router.patch('/admin/:id/approve', auth, admin, toggleApproveReview);
router.delete('/admin/:id', auth, admin, deleteReview);

module.exports = router;