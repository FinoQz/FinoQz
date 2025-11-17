const express = require('express');
const {
  initiateForgotPassword,
  verifyForgotPasswordOtp,
  resetPassword,
} = require('../controllers/forgotPasswordController');

const router = express.Router();

// Step 1: Initiate forgot password (send OTP)
router.post('/initiate', initiateForgotPassword);

// Step 2: Verify OTP
router.post('/verify', verifyForgotPasswordOtp);

// Step 3: Reset password
router.post('/reset', resetPassword);

module.exports = router;
