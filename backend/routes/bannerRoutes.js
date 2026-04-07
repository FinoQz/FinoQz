import express from 'express';
import {
  getActiveBanners,
  getAllBanners,
  createBanner,
  updateBanner,
  deleteBanner
} from '../controllers/bannerController.js';
import verifyToken from '../middlewares/verifyToken.js';
import requireAdmin from '../middlewares/requireAdmin.js';

const router = express.Router();

// Public / User route
router.get('/active', getActiveBanners);

// Admin routes
router.get('/all', verifyToken(), requireAdmin, getAllBanners);
router.post('/', verifyToken(), requireAdmin, createBanner);
router.put('/:id', verifyToken(), requireAdmin, updateBanner);
router.delete('/:id', verifyToken(), requireAdmin, deleteBanner);

export default router;
