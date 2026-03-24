import express from 'express';
import {
  getPublishedContent,
  getContentBySlug,
  createContent,
  updateContent,
  deleteContent,
  togglePublishContent,
  toggleVisibility,
  toggleFeatured,
  getAllContent
} from '../controllers/financeContentController.js';
import verifyToken from '../middlewares/verifyToken.js';
import requireAdmin from '../middlewares/requireAdmin.js';

const router = express.Router();

// Admin routes (protected) - MUST come first (most specific)
router.get('/admin/all', verifyToken(), requireAdmin, getAllContent);
router.post('/admin/create', verifyToken(), requireAdmin, createContent);
router.put('/admin/:id', verifyToken(), requireAdmin, updateContent);
router.delete('/admin/:id', verifyToken(), requireAdmin, deleteContent);
router.patch('/admin/:id/publish', verifyToken(), requireAdmin, togglePublishContent);
router.patch('/admin/:id/visibility', verifyToken(), requireAdmin, toggleVisibility);
router.patch('/admin/:id/featured', verifyToken(), requireAdmin, toggleFeatured);

// Public routes - comes after admin routes (least specific)
router.get('/', getPublishedContent);
router.get('/:slug', getContentBySlug);

export default router;
