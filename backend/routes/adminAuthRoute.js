const express = require('express');
const { login, verifyOtp } = require('../controllers/adminauthController');
const router = express.Router();

router.post('/login', login);
router.post('/verify-otp', verifyOtp);

module.exports = router;
