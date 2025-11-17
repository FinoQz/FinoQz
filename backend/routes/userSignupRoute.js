const express = require('express');
const {
  initiateSignup,
  verifyEmailOtp,
  resendEmailOtp,
  submitMobilePassword,
  verifyMobileOtp,
  resendMobileOtp,
  approveUser,
  rejectUser,
  getSignupStatus
} = require('../controllers/userSignupController');

const validateSignUp = require('../middlewares/validateSignup');
const validateOtp = require('../middlewares/validateOtp');
const authMiddleware = require('../middlewares/authMiddleware');
const requireAdmin = require('../middlewares/requireAdmin');

const router = express.Router();

// Step 1: Email OTP
router.post('/initiate', validateSignUp, initiateSignup);
router.post('/verify-email', validateOtp, verifyEmailOtp);
router.post('/resend-email-otp', resendEmailOtp);

// Step 2: Mobile + Password
router.post('/mobile-password', submitMobilePassword);
router.post('/verify-mobile', validateOtp, verifyMobileOtp);
router.post('/resend-mobile-otp', resendMobileOtp);

// Step 3: Get Signup Status
router.get("/status", getSignupStatus);

// Step 4: Admin actions
router.post('/approve/:userId', authMiddleware, requireAdmin, approveUser);
router.post('/reject/:userId', authMiddleware, requireAdmin, rejectUser);

module.exports = router;
