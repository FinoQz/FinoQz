// controllers/forgotPasswordController.js

const User = require('../models/User');
const bcrypt = require('bcrypt');

const redis = require('../utils/redis');
const emailQueue = require('../utils/emailQueue');
const logActivity = require('../utils/logActivity');

const generateOTP = require('../utils/generateOTP');
const forgotPasswordTemplate = require('../emailTemplates/forgotPasswordTemplate');
const getDeviceInfo = require('../utils/getDeviceInfo');


// ✅ Helper: rate-limit key generator
function getForgotRateKey(email) {
  return `user:forgotRate:${email}`;
}

// ✅ Helper: suspicious activity threshold config
const FORGOT_RATE_LIMIT = {
  maxAttempts: 5,        // max OTP requests in window
  windowSeconds: 60 * 60 // 1 hour
};

// ✅ Helper: get email from cookie or body or header
function extractEmail(req) {
  return (
    req.body?.email ||
    req.cookies?.resetEmail ||
    req.headers["x-reset-email"] ||
    null
  );
}


// ✅ STEP 1: Initiate forgot password (Redis + BullMQ + rate-limit)
exports.initiateForgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user)
      return res.status(404).json({ message: "No account found with this email" });

    // ✅ Rate-limit: track OTP requests per email
    const rateKey = getForgotRateKey(email);
    const current = await redis.incr(rateKey);

    if (current === 1) {
      // First attempt in this window → set TTL
      await redis.expire(rateKey, FORGOT_RATE_LIMIT.windowSeconds);
    }

    if (current > FORGOT_RATE_LIMIT.maxAttempts) {
      // Too many attempts → suspicious
      await logActivity({
        req,
        actorType: "user",
        actorId: user._id,
        action: "forgot_password_rate_limited",
        meta: {
          email,
          attempts: current,
          windowSeconds: FORGOT_RATE_LIMIT.windowSeconds,
          device: getDeviceInfo(req)
        }
      });

      return res.status(429).json({
        message: "Too many password reset attempts. Please try again later."
      });
    }

    // ✅ Generate OTP
    const otp = generateOTP();

    // ✅ Store OTP in Redis (10 min TTL)
    await redis.set(
      `user:forgotOtp:${email}`,
      JSON.stringify({ otp }),
      "EX",
      10 * 60
    );

    // ✅ Queue email (non-blocking)
    await emailQueue.add("userForgotPasswordOtp", {
      to: email,
      subject: "FinoQz Password Reset OTP",
      html: forgotPasswordTemplate({ otp }),
    });

    // ✅ Log activity
    await logActivity({
      req,
      actorType: "user",
      actorId: user._id,
      action: "forgot_password_otp_sent",
      meta: {
        email,
        rateAttempts: current,
        device: getDeviceInfo(req)
      }
    });

    return res.json({ message: "OTP sent", nextStep: "verify_reset_otp" });

  } catch (err) {
    console.error("Forgot password error:", err);
    return res.status(500).json({ message: "Server error during forgot password" });
  }
};



// ✅ STEP 2: Verify forgot-password OTP (Redis + suspicious activity logging)
// exports.verifyForgotPasswordOtp = async (req, res) => {
//   const { email, otp } = req.body;

//   try {
//     const user = await User.findOne({ email });
//     if (!user)
//       return res.status(404).json({ message: "User not found" });

//     const redisKey = `user:forgotOtp:${email}`;
//     const stored = await redis.get(redisKey);

//     if (!stored) {
//       await logActivity({
//         req,
//         actorType: "user",
//         actorId: user._id,
//         action: "forgot_password_otp_missing_or_expired",
//         meta: {
//           email,
//           device: getDeviceInfo(req)
//         }
//       });

//       return res.status(404).json({ message: "No OTP found or expired" });
//     }

//     const { otp: storedOtp } = JSON.parse(stored);

//     if (storedOtp !== otp) {
//       // Incorrect OTP → suspicious attempt log
//       await logActivity({
//         req,
//         actorType: "user",
//         actorId: user._id,
//         action: "forgot_password_otp_incorrect",
//         meta: {
//           email,
//           attemptedOtp: otp,
//           device: getDeviceInfo(req)
//         }
//       });

//       return res.status(403).json({ message: "Incorrect OTP" });
//     }

//     // ✅ OTP verified → delete it
//     await redis.del(redisKey);

//     await logActivity({
//       req,
//       actorType: "user",
//       actorId: user._id,
//       action: "forgot_password_otp_verified",
//       meta: {
//         email,
//         device: getDeviceInfo(req)
//       }
//     });

//     return res.json({ message: "OTP verified", nextStep: "reset_password" });

//   } catch (err) {
//     console.error("Verify forgot password OTP error:", err);
//     return res.status(500).json({ message: "Server error during OTP verification" });
//   }
// };
exports.verifyForgotPasswordOtp = async (req, res) => {
  const email = extractEmail(req);
  const { otp } = req.body;

  if (!email || !otp) {
    return res.status(400).json({ message: "Missing email or OTP" });
  }

  try {
    const user = await User.findOne({ email });
    if (!user)
      return res.status(404).json({ message: "User not found" });

    const redisKey = `user:forgotOtp:${email}`;
    const stored = await redis.get(redisKey);

    if (!stored) {
      await logActivity({
        req,
        actorType: "user",
        actorId: user._id,
        action: "forgot_password_otp_missing_or_expired",
        meta: { email, device: getDeviceInfo(req) }
      });

      return res.status(404).json({ message: "No OTP found or expired" });
    }

    const { otp: storedOtp } = JSON.parse(stored);

    if (storedOtp !== otp) {
      await logActivity({
        req,
        actorType: "user",
        actorId: user._id,
        action: "forgot_password_otp_incorrect",
        meta: { email, attemptedOtp: otp, device: getDeviceInfo(req) }
      });

      return res.status(403).json({ message: "Incorrect OTP" });
    }

    await redis.del(redisKey);

    await logActivity({
      req,
      actorType: "user",
      actorId: user._id,
      action: "forgot_password_otp_verified",
      meta: { email, device: getDeviceInfo(req) }
    });

    return res.json({ message: "OTP verified", nextStep: "reset_password" });

  } catch (err) {
    console.error("Verify forgot password OTP error:", err);
    return res.status(500).json({ message: "Server error during OTP verification" });
  }
};




// ✅ STEP 3: Reset password (with logging + optional alert email queue)
// exports.resetPassword = async (req, res) => {
//   const { email, newPassword } = req.body;

//   try {
//     const user = await User.findOne({ email });
//     if (!user)
//       return res.status(404).json({ message: "User not found" });

//     const hashedPassword = await bcrypt.hash(newPassword, 10);
//     user.passwordHash = hashedPassword;
//     await user.save();

//     // ✅ Clear any forgotten OTP remnants / rate counters (optional but clean)
//     await redis.del(`user:forgotOtp:${email}`);
//     await redis.del(getForgotRateKey(email));

//     // ✅ Log activity
//     await logActivity({
//       req,
//       actorType: "user",
//       actorId: user._id,
//       action: "password_reset_success",
//       meta: {
//         email,
//         device: getDeviceInfo(req)
//       }
//     });

//     // ✅ (Optional) Queue a "password changed" alert email
//     try {
//       await emailQueue.add("userPasswordResetAlert", {
//         to: email,
//         subject: "Your FinoQz Password Was Changed",
//         html: `
//           <p>Hi ${user.fullName || "there"},</p>
//           <p>Your FinoQz account password has been successfully changed.</p>
//           <p>If this wasn't you, please contact support immediately.</p>
//         `
//       });
//     } catch (queueErr) {
//       console.error("❌ Password reset alert email queue error:", queueErr);
//     }

//     return res.json({ message: "Password reset successful" });

//   } catch (err) {
//     console.error("Reset password error:", err);
//     return res.status(500).json({ message: "Server error during password reset" });
//   }
// };
exports.resetPassword = async (req, res) => {
  const email = extractEmail(req);
  const { newPassword } = req.body;

  if (!email || !newPassword) {
    return res.status(400).json({ message: "Missing email or new password" });
  }

  try {
    const user = await User.findOne({ email });
    if (!user)
      return res.status(404).json({ message: "User not found" });

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.passwordHash = hashedPassword;
    await user.save();

    await redis.del(`user:forgotOtp:${email}`);
    await redis.del(getForgotRateKey(email));

    await logActivity({
      req,
      actorType: "user",
      actorId: user._id,
      action: "password_reset_success",
      meta: { email, device: getDeviceInfo(req) }
    });

    try {
      await emailQueue.add("userPasswordResetAlert", {
        to: email,
        subject: "Your FinoQz Password Was Changed",
        html: `
          <p>Hi ${user.fullName || "there"},</p>
          <p>Your FinoQz account password has been successfully changed.</p>
          <p>If this wasn't you, please contact support immediately.</p>
        `
      });
    } catch (queueErr) {
      console.error("❌ Password reset alert email queue error:", queueErr);
    }

    return res.json({ message: "Password reset successful" });

  } catch (err) {
    console.error("Reset password error:", err);
    return res.status(500).json({ message: "Server error during password reset" });
  }
};
