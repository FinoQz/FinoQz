import express from 'express';
import { getLanding, saveLanding } from '../controllers/landingController.js';

const router = express.Router();

// GET landing content
router.get('/', getLanding);

// PATCH landing content (no file upload)
router.patch('/', saveLanding);

export default router;
