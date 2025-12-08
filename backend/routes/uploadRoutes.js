// routes/uploadRoutes.js
const express = require('express');
const router = express.Router();
const uploadController = require('../controllers/uploadController');
const authMiddleware = require('../middlewares/authMiddleware'); // require admin if you want only admins

// public endpoint to upload PDF and get extracted questions back
// If you want only admins to use it, use authMiddleware('admin') as 2nd arg
router.post('/pdf', /* authMiddleware('admin'), */ uploadController.uploadPdf);

// Accept JSON questions (client-side CSV->JSON conversion)
router.post('/json', /* authMiddleware('admin'), */ uploadController.uploadJson);

module.exports = router;