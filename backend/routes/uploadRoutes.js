// routes/uploadRoutes.js
const express = require('express');
const router = express.Router();
const uploadController = require('../controllers/uploadController');
const authMiddleware = require('../middlewares/authMiddleware'); // require admin if you want only admins

// PDF upload (extract questions)
router.post('/pdf', authMiddleware('admin'), uploadController.uploadPdf);

// JSON upload (import questions)
router.post('/json', authMiddleware('admin'), uploadController.uploadJson);

// Manual upload (import questions)
router.post('/manual', authMiddleware('admin'), uploadController.uploadManual);

module.exports = router;