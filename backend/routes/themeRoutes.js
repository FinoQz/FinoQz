import express from 'express';
import rateLimit from 'express-rate-limit';
import { getTheme, updateTheme } from '../controllers/themeController.js';
import verifyToken from '../middlewares/verifyToken.js';
import requireAdmin from '../middlewares/requireAdmin.js';

const router = express.Router();

// Limit theme writes to 30 per 15 minutes per IP
const themeMutateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Too many theme update requests, please try again later.',
});

// Public: get current theme (used by all frontend clients)
router.get('/', getTheme);

// Admin only: update theme settings
router.patch('/', themeMutateLimiter, verifyToken(), requireAdmin, updateTheme);

export default router;
