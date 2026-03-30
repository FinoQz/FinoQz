import express from 'express';
import {
  createReview,
  getPinnedReviews,
  getAllReviews,
  togglePinReview,
  toggleApproveReview,
  deleteReview
} from '../controllers/reviewController.js';
import verifyToken from '../middlewares/verifyToken.js';
import requireAdmin from '../middlewares/requireAdmin.js';

const router = express.Router();

// Public routes
router.post('/', createReview);
router.get('/pinned', getPinnedReviews);

// Admin routes
router.get('/admin/all', verifyToken(), requireAdmin, getAllReviews);
router.patch('/admin/:id/pin', verifyToken(), requireAdmin, togglePinReview);
router.patch('/admin/:id/approve', verifyToken(), requireAdmin, toggleApproveReview);
router.delete('/admin/:id', verifyToken(), requireAdmin, deleteReview);

export default router;