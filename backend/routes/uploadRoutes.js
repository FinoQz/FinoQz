import express from 'express';
import * as uploadController from '../controllers/uploadController.js';
import authMiddleware from '../middlewares/authMiddleware.js';

const router = express.Router();

// PDF upload (extract questions)
router.post('/pdf', authMiddleware('admin'), uploadController.uploadPdf);

// JSON upload (import questions)
router.post('/json', authMiddleware('admin'), uploadController.uploadJson);

// Manual upload (import questions)
router.post('/manual', authMiddleware('admin'), uploadController.uploadManual);

// Excel upload (import questions)
router.post('/excel', authMiddleware('admin'), uploadController.uploadExcel);

// AI Text extraction from resources (PDF, Excel, Txt)
router.post('/extract-text', authMiddleware('admin', 'user'), uploadController.extractText);

export default router;