// routes/userSignupRoute.js

import express from 'express';
import {
  initiateSignup,
  verifyEmailOtp,
  resendEmailOtp,
  submitMobilePassword,
  verifyMobileOtp,
  resendMobileOtp,
  approveUser,
  rejectUser,
  getSignupStatus
} from '../controllers/userSignupController.js';
import validateSignUp from '../middlewares/validateSignup.js';
import validateOtp from '../middlewares/validateOtp.js';
import authMiddleware from '../middlewares/authMiddleware.js';
import requireAdmin from '../middlewares/requireAdmin.js';

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

export default router;
