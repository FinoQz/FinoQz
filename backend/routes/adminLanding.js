const express = require('express');
const router = express.Router();
const { getLanding, saveLanding } = require('../controllers/landingController');

// GET landing content
router.get('/', getLanding);

// PATCH landing content (no file upload)
router.patch('/', saveLanding);

module.exports = router;
