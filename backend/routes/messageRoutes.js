import express from 'express';
import { 
  getChatSettings, 
  updateChatSettings, 
  getChatHistory, 
  getActiveConversations 
} from '../controllers/messageController.js';
import verifyToken from '../middlewares/verifyToken.js';
import requireAdmin from '../middlewares/requireAdmin.js';

const router = express.Router();

// Settings
router.get('/settings', verifyToken(), getChatSettings);
router.put('/settings', verifyToken(), requireAdmin, updateChatSettings);

// History
router.get('/history', verifyToken(), getChatHistory);

// Admin Analytics
router.get('/conversations', verifyToken(), requireAdmin, getActiveConversations);

export default router;
