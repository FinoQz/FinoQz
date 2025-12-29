const express = require('express');
const router = express.Router();
const multer = require('multer');
const { getLanding, saveLanding } = require('../controllers/landingController');

const upload = multer({ dest: 'temp/' }); // temp folder for uploaded files

// GET landing content
router.get('/', getLanding);

// PATCH landing content with optional image
router.patch('/', upload.single('file'), saveLanding);

module.exports = router;
