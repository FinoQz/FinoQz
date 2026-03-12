import express from 'express';
import {
  getPublishedContent,
  getContentBySlug,
  createContent,
  updateContent,
  deleteContent,
  togglePublishContent,
  getAllContent
} from '../controllers/financeContentController.js';
import requireAdmin from '../middlewares/requireAdmin.js';
import authMiddleware from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/', getPublishedContent);
router.get('/:slug', getContentBySlug);

// Admin routes
router.get('/admin/all',authMiddleware('admin'), requireAdmin, getAllContent);
router.post('/admin/create', authMiddleware('admin'), requireAdmin, createContent);
router.put('/admin/:id', authMiddleware('admin'), requireAdmin, updateContent);
router.delete('/admin/:id', authMiddleware('admin'), requireAdmin, deleteContent);
router.patch('/admin/:id/publish', authMiddleware('admin'), requireAdmin, togglePublishContent);

export default router;
