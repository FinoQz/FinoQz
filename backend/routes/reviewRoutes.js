const express = require('express');
const router = express.Router();

const {
  createReview,
  getReviews,
  getFeaturedReviews,
  updateReviewStatus
} = require('../controllers/reviewController');

// TODO: replace with your actual auth middleware paths
const auth = require('../middlewares/authMiddleware');
const admin = require('../middlewares/adminAuth');

// Public
router.post('/', createReview);
router.get('/featured', getFeaturedReviews);

// Admin
router.get('/', auth, admin, getReviews);
router.patch('/:reviewId', auth, admin, updateReviewStatus);

module.exports = router;