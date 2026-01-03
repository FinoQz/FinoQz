// routes/userSignupRoute.js

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

/* ---------------------------------------------------------
   ✅ STEP 1: EMAIL OTP FLOW
--------------------------------------------------------- */
router.post('/initiate', validateSignUp, initiateSignup);
router.post('/verify-email', validateOtp, verifyEmailOtp);
router.post('/resend-email-otp', resendEmailOtp);

/* ---------------------------------------------------------
   ✅ STEP 2: MOBILE + PASSWORD FLOW
--------------------------------------------------------- */
router.post('/mobile-password', submitMobilePassword);
router.post('/verify-mobile',  verifyMobileOtp);
router.post('/resend-mobile-otp', resendMobileOtp);

/* ---------------------------------------------------------
   ✅ STEP 3: SIGNUP STATUS
--------------------------------------------------------- */
router.get('/status', getSignupStatus);

/* ---------------------------------------------------------
   ✅ STEP 4: ADMIN ACTIONS (Protected)
--------------------------------------------------------- */
// router.post('/approve/:userId', authMiddleware(), requireAdmin, approveUser);
// router.post('/reject/:userId', authMiddleware(), requireAdmin, rejectUser);

module.exports = router;
