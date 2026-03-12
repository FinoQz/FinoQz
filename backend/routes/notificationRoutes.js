import express from 'express';
import {
  getUserNotifications,
  markAllAsRead
} from '../controllers/notificationController.js';
import auth from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/', auth, getUserNotifications);
router.patch('/read-all', auth, markAllAsRead);

export default router;
