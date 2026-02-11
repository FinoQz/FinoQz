const express = require('express');
const {login,verifyLoginOtp,logout,refreshToken,resendOtp} = require('../controllers/userLoginController');
const { getUserPanel } = require('../controllers/userPanelController');
const validateLogin = require('../middlewares/validateLogin');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

const rateLimit = require('express-rate-limit');

const loginLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  message: "Too many login attempts. Try later."
});


router.post('/initiate', loginLimiter, validateLogin, login);

router.post('/verify', loginLimiter, verifyLoginOtp);

router.post('/resend-otp', loginLimiter, resendOtp);

router.get('/user_dash', authMiddleware(), getUserPanel);

router.post('/logout', authMiddleware(), logout);

router.post('/refresh-token', refreshToken);



module.exports = router;

