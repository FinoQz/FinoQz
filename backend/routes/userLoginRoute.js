const express = require('express');
const {
  login,
  verifyLoginOtp,
  logout,
  refreshToken,
  resendOtp
} = require('../controllers/userLoginController');
const { getUserPanel } = require('../controllers/userPanelController');
const validateLogin = require('../middlewares/validateLogin');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

// Step 1: Initiate login
router.post('/initiate', validateLogin, login);

// Step 2: Verify OTP
router.post('/verify', verifyLoginOtp);

// Step 3: User Panel (Protected)
router.get('/user_dash', authMiddleware(), getUserPanel);

// Step 4: Logout
router.post('/logout', authMiddleware(), logout);

// Step 5: Refresh Token
router.post('/refresh-token', refreshToken);

// Step 6: Resend OTP
router.post('/resend-otp', resendOtp);


module.exports = router;

