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


const requireAdmin = require('../middlewares/requireAdmin');
const authMiddleware = require('../middlewares/authMiddleware');


router.get('/', getPublishedContent);
router.get('/:slug', getContentBySlug);

// Admin routes
router.get('/admin/all',authMiddleware('admin'), requireAdmin, getAllContent);
router.post('/admin/create', authMiddleware('admin'), requireAdmin, createContent);
router.put('/admin/:id', authMiddleware('admin'), requireAdmin, updateContent);
router.delete('/admin/:id', authMiddleware('admin'), requireAdmin, deleteContent);
router.patch('/admin/:id/publish', authMiddleware('admin'), requireAdmin, togglePublishContent);

module.exports = router;
