import express from 'express';
import { getActivityLogs, clearAllLogs } from '../controllers/activityLogController.js';
import authMiddleware from '../middlewares/authMiddleware.js';
import requireAdmin from '../middlewares/requireAdmin.js';

const router = express.Router();

router.get('/', authMiddleware('admin'), requireAdmin, getActivityLogs);

// ✅ NEW CLEAR LOGS ROUTE
router.delete('/clear', authMiddleware('admin'), requireAdmin, clearAllLogs);

export default router;
