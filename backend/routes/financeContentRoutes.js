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
  getAllContent,
  getYouTubeMetadata,
  addEngagement,
  getEngagement,
  likeEngagement,
  deleteEngagement,
  adminDeleteEngagement,
  adminGetAllDiscussions,
  getContentAnalytics
} from '../controllers/financeContentController.js';
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  createSubcategory,
  updateSubcategory,
  deleteSubcategory
} from '../controllers/financeCategoryController.js';
import verifyToken from '../middlewares/verifyToken.js';
import requireAdmin from '../middlewares/requireAdmin.js';

const router = express.Router();

// --- Category Routes (Admin) ---
router.get('/categories', getCategories); // Publicly get categories for nav
router.post('/categories', verifyToken(), requireAdmin, createCategory);
router.put('/categories/:id', verifyToken(), requireAdmin, updateCategory);
router.delete('/categories/:id', verifyToken(), requireAdmin, deleteCategory);

router.post('/subcategories', verifyToken(), requireAdmin, createSubcategory);
router.put('/subcategories/:id', verifyToken(), requireAdmin, updateSubcategory);
router.delete('/subcategories/:id', verifyToken(), requireAdmin, deleteSubcategory);

// --- Admin Content Routes ---
router.get('/admin/all', verifyToken(), requireAdmin, getAllContent);
router.post('/admin/create', verifyToken(), requireAdmin, createContent);
router.put('/admin/:id', verifyToken(), requireAdmin, updateContent);
router.delete('/admin/:id', verifyToken(), requireAdmin, deleteContent);
router.patch('/admin/:id/publish', verifyToken(), requireAdmin, togglePublishContent);
router.patch('/admin/:id/visibility', verifyToken(), requireAdmin, toggleVisibility);
router.patch('/admin/:id/featured', verifyToken(), requireAdmin, toggleFeatured);
router.get('/admin/youtube-meta', verifyToken(), requireAdmin, getYouTubeMetadata);
router.get('/admin/analytics', verifyToken(), requireAdmin, getContentAnalytics);

// --- Public Content Routes ---
router.get('/', getPublishedContent);
router.get('/:slug', getContentBySlug);
router.get('/:id/engagement', getEngagement);
router.post('/:id/engagement', verifyToken(), addEngagement);
router.post('/engagement/:id/like', verifyToken(), likeEngagement);
router.delete('/engagement/:id', verifyToken(), deleteEngagement);

// --- Admin Discussion Moderation ---
router.get('/admin/discussions', verifyToken(), requireAdmin, adminGetAllDiscussions);
router.delete('/admin/discussions/:id', verifyToken(), requireAdmin, adminDeleteEngagement);

export default router;
