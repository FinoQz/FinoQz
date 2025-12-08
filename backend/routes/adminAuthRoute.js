const express = require('express');
const { login, verifyOtp } = require('../controllers/adminAuthController');
const sendEmail = require('../utils/sendEmail'); // import your mail util

const router = express.Router();

router.post('/login', login);
router.post('/verify-otp', verifyOtp);



module.exports = router;
// const express = require('express');
// const { celebrate, Joi, errors } = require('celebrate');
// const rateLimit = require('express-rate-limit');
// const { login, verifyOtp, refreshToken } = require('../controllers/adminAuthController');
// const logger = require('../utils/logger');

// const router = express.Router();

// // Stricter rate limit for login/OTP
// const authLimiter = rateLimit({
//   windowMs: 5 * 60 * 1000, // 5 minutes
//   max: 5,
//   standardHeaders: true,
//   legacyHeaders: false,
//   message: 'Too many authentication attempts, please try again later.'
// });

// // Validation schemas
// const loginSchema = celebrate({
//   body: Joi.object({
//     identifier: Joi.string().required(),
//     password: Joi.string().min(8).required()
//   })
// });

// const otpSchema = celebrate({
//   body: Joi.object({
//     email: Joi.string().email().optional(),
//     identifier: Joi.string().optional(),
//     otp: Joi.string().length(6).required()
//   })
// });

// // Routes
// router.post('/login', authLimiter, loginSchema, login);
// router.post('/verify-otp', authLimiter, otpSchema, verifyOtp);
// router.post('/refresh-token', refreshToken);

// // Celebrate error handler
// router.use(errors());

// module.exports = router;
