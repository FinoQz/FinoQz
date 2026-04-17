import express from 'express';
import { handleChatMessage } from '../controllers/chatController.js';

const router = express.Router();

// Public route for landing page chatbot
router.post('/', handleChatMessage);

export default router;
