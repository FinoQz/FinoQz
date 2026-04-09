import express from 'express';
import { 
  createSuggestion, 
  getSuggestions, 
  updateSuggestionStatus, 
  deleteSuggestion 
} from '../controllers/suggestionController.js';
import verifyToken from '../middlewares/verifyToken.js';
import requireAdmin from '../middlewares/requireAdmin.js';

const router = express.Router();

// Public: Submit a suggestion
router.post('/', createSuggestion);

// Admin: Manage suggestions
router.get('/', verifyToken(), requireAdmin, getSuggestions);
router.patch('/:id', verifyToken(), requireAdmin, updateSuggestionStatus);
router.delete('/:id', verifyToken(), requireAdmin, deleteSuggestion);

export default router;
