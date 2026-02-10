const express = require('express');
const router = express.Router();

const {
  getPublishedContent,
  getContentBySlug,
  createContent,
  updateContent,
  deleteContent,
  togglePublishContent,
  getAllContent
} = require('../controllers/financeContentController');

const auth = require('../middlewares/authMiddleware');
const admin = require('../middlewares/adminAuth');

// Public routes
router.get('/', getPublishedContent);
router.get('/:slug', getContentBySlug);

// Admin routes
router.get('/admin/all', auth, admin, getAllContent);
router.post('/admin/create', auth, admin, createContent);
router.put('/admin/:id', auth, admin, updateContent);
router.delete('/admin/:id', auth, admin, deleteContent);
router.patch('/admin/:id/publish', auth, admin, togglePublishContent);

module.exports = router;
