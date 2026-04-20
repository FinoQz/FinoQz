import express from 'express';
import { subscribe, unsubscribe, getSubscribers, exportSubscribers } from '../controllers/newsletterController.js';
import verifyToken from '../middlewares/verifyToken.js';

const router = express.Router();

// Public routes
router.post('/subscribe', subscribe);
router.get('/unsubscribe', unsubscribe);

// Admin routes
router.get('/admin/all', verifyToken('admin'), getSubscribers);
router.get('/admin/export', verifyToken('admin'), exportSubscribers);

export default router;
