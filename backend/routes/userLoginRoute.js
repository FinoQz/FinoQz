import express from 'express';
import rateLimit from 'express-rate-limit';
import { login, verifyLoginOtp, logout, refreshToken, resendOtp } from '../controllers/userLoginController.js';
import { getUserPanel } from '../controllers/userPanelController.js';
import validateLogin from '../middlewares/validateLogin.js';
import authMiddleware from '../middlewares/authMiddleware.js';

const router = express.Router();

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

export default router;

