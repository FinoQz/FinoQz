import express from 'express';
import { getLanding, saveLanding } from '../controllers/landingController.js';
import verifyToken from '../middlewares/verifyToken.js';
import requireAdmin from '../middlewares/requireAdmin.js';

const router = express.Router();

// GET landing content (public for frontend)
router.get('/', getLanding);

// PATCH landing content (admin only)
router.patch('/', verifyToken(), requireAdmin, saveLanding);

export default router;
