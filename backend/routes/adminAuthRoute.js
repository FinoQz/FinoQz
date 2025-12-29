const express = require('express');
const { celebrate, Joi, Segments } = require('celebrate');
const rateLimit = require('express-rate-limit');
const { login, verifyOtp, refreshToken } = require('../controllers/adminAuthController');

const router = express.Router();

// ⏱️ Stricter rate limit for login/OTP
const authLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Too many authentication attempts, please try again later.'
});

// 🛡️ Validation schemas

// Login → always needs identifier + password
const loginSchema = celebrate({
  [Segments.BODY]: Joi.object({
    identifier: Joi.string().required(),
    password: Joi.string().min(8).required()
  })
});

// OTP verify → allow either email OR identifier
  const otpSchema = celebrate({
  [Segments.BODY]: Joi.object({
    identifier: Joi.string().required(),
    otp: Joi.string().length(6).required()
  })
});
// 🔌 Routes
router.post('/login', authLimiter, loginSchema, login);
router.post('/verify-otp', authLimiter, otpSchema, verifyOtp);
router.post('/refresh-token', refreshToken);

module.exports = router;
