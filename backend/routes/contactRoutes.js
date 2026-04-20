import express from 'express';
import { submitQuery, getQueries, updateQueryStatus, respondToQuery, deleteQuery } from '../controllers/contactController.js';
import verifyToken from '../middlewares/verifyToken.js';

const router = express.Router();

// Public route
router.post('/', submitQuery);

// Admin routes
router.get('/admin/all', verifyToken('admin'), getQueries);
router.patch('/admin/:id', verifyToken('admin'), updateQueryStatus);
router.post('/admin/respond/:id', verifyToken('admin'), respondToQuery);
router.delete('/admin/:id', verifyToken('admin'), deleteQuery);

export default router;
