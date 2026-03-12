import express from 'express';
import { celebrate, Joi, Segments, errors } from 'celebrate';
import rateLimit from 'express-rate-limit';
import { login, verifyOtp, refreshToken, getPendingEmail, resendOtp, logout } from '../controllers/adminAuthController.js';
import authMiddleware from '../middlewares/authMiddleware.js';
import requireAdmin from '../middlewares/requireAdmin.js';

const router = express.Router();

// ⏱️ Rate limiter for auth-sensitive routes
const authLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Too many authentication attempts, please try again later.',
});

// 🛡️ Validation Schemas

const loginSchema = celebrate({
  [Segments.BODY]: Joi.object({
    identifier: Joi.string().required(),
    password: Joi.string().min(8).required(),
  }),
});

const otpSchema = celebrate({
  [Segments.BODY]: Joi.object({
    identifier: Joi.string().required(),
    otp: Joi.string().length(6).required(),
  }),
});

const resendOtpSchema = celebrate({
  [Segments.BODY]: Joi.object({
    email: Joi.string().email().optional(),
    identifier: Joi.string().optional(),
  }),
});



router.post('/login', authLimiter, loginSchema, login);
router.post('/verify-otp', authLimiter, otpSchema, verifyOtp);
router.post('/resend-otp', authLimiter, resendOtpSchema, resendOtp);
router.post('/refresh-token', refreshToken);

router.post('/logout',authMiddleware('admin'),requireAdmin,logout);

router.get('/pending-email',getPendingEmail);

// 🧼 Celebrate error handler (must be after all routes)
router.use(errors());

export default router;

