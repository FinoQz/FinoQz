const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const redis = require('../utils/redis');
const emailQueue = require('../utils/emailQueue');
const logActivity = require('../utils/logActivity');

const generateOTP = require('../utils/generateOTP');
const signinOtpTemplate = require('../emailTemplates/signinotpTemplate');
const getDeviceInfo = require('../utils/getDeviceInfo');


// ✅ STEP 1 — LOGIN (Password Check + Redis OTP + Queue Email)
exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user)
      return res.status(401).json({ message: "Invalid email or password" });

    if (user.status !== "approved")
      return res.status(403).json({ message: "Account not approved yet" });

    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match)
      return res.status(401).json({ message: "Invalid email or password" });

    // ✅ Generate OTP
    const otp = generateOTP();

    // ✅ Store OTP in Redis (10 min TTL)
    await redis.set(
      `user:loginOtp:${email}`,
      JSON.stringify({ otp }),
      "EX",
      10 * 60
    );

    // ✅ Queue email job (safe)
    try {
      await emailQueue.add("userLoginOtp", {
        to: email,
        subject: "FinoQz Login OTP",
        html: signinOtpTemplate({ otp }),
      });
    } catch (queueErr) {
      console.error("❌ Queue error (login OTP):", queueErr);
    }

    // ✅ Log activity
    await logActivity({
      req,
      actorType: "user",
      actorId: user._id,
      action: "login_otp_sent",
      meta: {
        email,
        device: getDeviceInfo(req)
      }
    });

    return res.json({
      message: "OTP sent to email",
      nextStep: "verify_login_otp",
    });

  } catch (err) {
    console.error("User login error:", err);
    return res.status(500).json({ message: "Server error during login" });
  }
};



// ✅ STEP 2 — VERIFY LOGIN OTP (Redis)
exports.verifyLoginOtp = async (req, res) => {
  const { email, otp } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user)
      return res.status(404).json({ message: "User not found" });

    const redisKey = `user:loginOtp:${email}`;
    const stored = await redis.get(redisKey);

    if (!stored)
      return res.status(404).json({ message: "No OTP found or expired" });

    const { otp: storedOtp } = JSON.parse(stored);

    if (storedOtp !== otp) {
      await logActivity({
        req,
        actorType: "user",
        actorId: user._id,
        action: "login_otp_incorrect",
        meta: { email }
      });

      return res.status(403).json({ message: "Incorrect OTP" });
    }

    // ✅ OTP verified → issue JWT
    const token = jwt.sign(
      { id: user._id, role: "user" },
      process.env.JWT_SECRET,
      { expiresIn: "30m" }
    );

    // ✅ Delete OTP from Redis
    await redis.del(redisKey);

    // ✅ Update last login timestamp
    user.lastLoginAt = new Date();
    await user.save();

    // ✅ Log successful login
    await logActivity({
      req,
      actorType: "user",
      actorId: user._id,
      action: "login_success",
      meta: {
        email,
        device: getDeviceInfo(req)
      }
    });

    return res.json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
      },
      redirect: "/user_dash",
    });

  } catch (err) {
    console.error("Verify login OTP error:", err);
    return res.status(500).json({ message: "Server error during OTP verification" });
  }
};
