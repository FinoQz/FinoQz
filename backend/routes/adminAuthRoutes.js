// const express = require('express');
// const { celebrate, Joi, Segments } = require('celebrate');
// const rateLimit = require('express-rate-limit');
// const {
//   login,
//   verifyOtp,
//   refreshToken,
//   getPendingEmail,
//   resendOtp, // ✅ NEW
// } = require('../controllers/adminAuthController');

// const router = express.Router();

// // ⏱️ Stricter rate limit for login/OTP/resend
// const authLimiter = rateLimit({
//   windowMs: 5 * 60 * 1000, // 5 minutes
//   max: 5,
//   standardHeaders: true,
//   legacyHeaders: false,
//   message: 'Too many authentication attempts, please try again later.',
// });

// // 🛡️ Validation schemas

// // Login → always needs identifier + password
// const loginSchema = celebrate({
//   [Segments.BODY]: Joi.object({
//     identifier: Joi.string().required(),
//     password: Joi.string().min(8).required(),
//   }),
// });

// // OTP verify → allow either email OR identifier
// const otpSchema = celebrate({
//   [Segments.BODY]: Joi.object({
//     identifier: Joi.string().required(),
//     otp: Joi.string().length(6).required(),
//   }),
// });

// // Resend OTP → allow either email OR identifier (optional, fallback to cookie)
// const resendOtpSchema = celebrate({
//   [Segments.BODY]: Joi.object({
//     email: Joi.string().email().optional(),
//     identifier: Joi.string().optional(),
//   }),
// });

// // 🔌 Routes
// router.post('/login', authLimiter, loginSchema, login);
// router.post('/verify-otp', authLimiter, otpSchema, verifyOtp);
// router.post('/resend-otp', authLimiter, resendOtpSchema, resendOtp); // ✅ NEW
// router.post('/refresh-token', refreshToken);
// router.get('/pending-email', getPendingEmail);

// module.exports = router;

const express = require('express');
const { celebrate, Joi, Segments, errors } = require('celebrate');
const rateLimit = require('express-rate-limit');
const {
  login,
  verifyOtp,
  refreshToken,
  getPendingEmail,
  resendOtp,
  logout
} = require('../controllers/adminAuthController');
const adminAuth = require('../middlewares/adminAuth');

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

// 🔐 Auth Routes

router.post('/login', authLimiter, loginSchema, login);
router.post('/verify-otp', authLimiter, otpSchema, verifyOtp);
router.post('/resend-otp', authLimiter, resendOtpSchema, resendOtp);
router.post('/refresh-token', refreshToken);
router.post('/logout', adminAuth, logout);

// 🔒 Protected Routes (require admin token)
router.get('/pending-email', getPendingEmail);

// 🧼 Celebrate error handler (must be after all routes)
router.use(errors());

module.exports = router;

