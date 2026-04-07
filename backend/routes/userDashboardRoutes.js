import express from 'express';
import { getDashboardSummary } from '../controllers/userDashboardController.js';
import authMiddleware from '../middlewares/authMiddleware.js';

const router = express.Router();

// Get user dashboard summary stats
router.get('/summary', authMiddleware(), getDashboardSummary);

export default router;
