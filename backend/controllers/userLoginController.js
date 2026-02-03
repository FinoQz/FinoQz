const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const redis = require('../utils/redis');
const emailQueue = require('../utils/emailQueue');
const logActivity = require('../utils/logActivity');

const generateOTP = require('../utils/generateOTP');
const signinOtpTemplate = require('../emailTemplates/signinotpTemplate');
const getDeviceInfo = require('../utils/getDeviceInfo');

const { emitLiveUserStats } = require('../utils/emmiters');

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

    const otp = generateOTP();

    await redis.set(
      `user:loginOtp:${email}`,
      JSON.stringify({ otp }),
      "EX",
      10 * 60
    );

    try {
      await emailQueue.add("userLoginOtp", {
        to: email,
        subject: "FinoQz Login OTP",
        html: signinOtpTemplate({ otp }),
      });
    } catch (queueErr) {
      console.error("❌ Queue error (login OTP):", queueErr);
    }

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

// ✅ STEP 2 — VERIFY OTP → ISSUE TOKEN + COOKIE
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

    const crypto = require('crypto');
    const sha256Hex = (input) =>
      crypto.createHash('sha256').update(String(input || '')).digest('hex');

    const ip = req.ip || req.connection?.remoteAddress || '';
    const userAgent = req.get('user-agent') || '';
    const fingerprint = sha256Hex(ip + '|' + userAgent);

    const now = Math.floor(Date.now() / 1000);
    const expiresInSeconds = 86400;

    const payload = {
      id: user._id,
      role: 'user',
      fingerprint,
      iat: now,
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: expiresInSeconds,
    });

    await redis.set(`session:${user._id}`, token, 'EX', expiresInSeconds);

    await redis.del(redisKey);

    user.lastLoginAt = new Date();
    await user.save();

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

    // ✅ Set token in HTTP-only cookie
    res.cookie('userToken', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: expiresInSeconds * 1000,
    });

    await redis.sadd('liveUsers', user._id.toString());
    await redis.set(`liveUser:${user._id}`, 1, 'EX', 900); // 15 min expiry

    const io = req.app.get('io');
    if (io) {
      await emitLiveUserStats(io);
    }

    return res.json({
      message: "Login successful",
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

// ✅ STEP 3 — LOGOUT
exports.logout = async (req, res) => {
  try {
    await redis.del(`session:${req.userId}`);

    // ✅ Clear cookie
    res.clearCookie('userToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
    });

    await redis.srem('liveUsers', req.userId?.toString());

    return res.json({ message: 'Logged out successfully' });
  } catch (err) {
    console.error('Logout error:', err);
    return res.status(500).json({ message: 'Server error during logout' });
  }
};

// ✅ STEP 4 — REFRESH TOKEN
exports.refreshToken = async (req, res) => {
  try {
    const oldToken = req.cookies?.userToken || req.headers['authorization']?.split(' ')[1];
    if (!oldToken) {
      return res.status(401).json({ message: 'No token provided' });
    }

    let decoded;
    try {
      decoded = jwt.verify(oldToken, process.env.JWT_SECRET, { ignoreExpiration: true });
    } catch (err) {
      return res.status(401).json({ message: 'Invalid token' });
    }

    // ✅ Check Redis for session token
    const storedToken = await redis.get(`session:${decoded.id}`);
    if (!storedToken || storedToken !== oldToken) {
      return res.status(403).json({ message: 'Session expired or invalid' });
    }

    // ✅ Generate new access token
    const now = Math.floor(Date.now() / 1000);
    const expiresInSeconds = 86400;

    const newToken = jwt.sign(
      {
        id: decoded.id,
        role: decoded.role || 'user',
        fingerprint: decoded.fingerprint,
        iat: now,
      },
      process.env.JWT_SECRET,
      { expiresIn: expiresInSeconds }
    );

    // ✅ Update Redis session
    await redis.set(`session:${decoded.id}`, newToken, 'EX', expiresInSeconds);

    // ✅ Set new cookie
    res.cookie('userToken', newToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: expiresInSeconds * 1000,
    });

    return res.json({ message: 'Token refreshed' });
  } catch (err) {
    console.error('❌ Refresh token error:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// ✅ STEP 5 — RESEND OTP
exports.resendOtp = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: "Email is required to resend OTP" });
  }

  try {
    const user = await User.findOne({ email });
    if (!user)
      return res.status(404).json({ message: "User not found" });

    if (user.status !== "approved")
      return res.status(403).json({ message: "Account not approved yet" });

    const otp = generateOTP();

    await redis.set(
      `user:loginOtp:${email}`,
      JSON.stringify({ otp }),
      "EX",
      10 * 60
    );

    try {
      await emailQueue.add("userLoginOtp", {
        to: email,
        subject: "FinoQz Login OTP",
        html: signinOtpTemplate({ otp }),
      });
    } catch (queueErr) {
      console.error("❌ Queue error (resend OTP):", queueErr);
    }

    await logActivity({
      req,
      actorType: "user",
      actorId: user._id,
      action: "login_otp_resent",
      meta: {
        email,
        device: getDeviceInfo(req)
      }
    });

    return res.json({
      message: "OTP resent to email",
    });

  } catch (err) {
    console.error("Resend OTP error:", err);
    return res.status(500).json({ message: "Server error during OTP resend" });
  }
};

// ✅ STEP 6 — LOGOUT
exports.logout = async (req, res) => {
  try {
    await redis.del(`session:${req.userId}`);

    // ✅ Clear cookie
    res.clearCookie('userToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
    });

    await redis.srem('liveUsers', req.userId?.toString());

    return res.json({ message: 'Logged out successfully' });
  } catch (err) {
    console.error('Logout error:', err);
    return res.status(500).json({ message: 'Server error during logout' });
  }
};

// ✅ STEP 7 — REFRESH TOKEN
exports.refreshToken = async (req, res) => {
  try {
    const oldToken = req.cookies?.userToken || req.headers['authorization']?.split(' ')[1];
    if (!oldToken) {
      return res.status(401).json({ message: 'No token provided' });
    }

    let decoded;
    try {
      decoded = jwt.verify(oldToken, process.env.JWT_SECRET, { ignoreExpiration: true });
    } catch (err) {
      return res.status(401).json({ message: 'Invalid token' });
    }

    // ✅ Check Redis for session token
    const storedToken = await redis.get(`session:${decoded.id}`);
    if (!storedToken || storedToken !== oldToken) {
      return res.status(403).json({ message: 'Session expired or invalid' });
    }

    // ✅ Generate new access token
    const now = Math.floor(Date.now() / 1000);
    const expiresInSeconds = 86400;

    const newToken = jwt.sign(
      {
        id: decoded.id,
        role: decoded.role || 'user',
        fingerprint: decoded.fingerprint,
        iat: now,
      },
      process.env.JWT_SECRET,
      { expiresIn: expiresInSeconds }
    );

    // ✅ Update Redis session
    await redis.set(`session:${decoded.id}`, newToken, 'EX', expiresInSeconds);

    // ✅ Set new cookie
    res.cookie('userToken', newToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: expiresInSeconds * 1000,
    });

    return res.json({ message: 'Token refreshed' });
  } catch (err) {
    console.error('❌ Refresh token error:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// ✅ STEP 8 — RESEND OTP
exports.resendOtp = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: "Email is required to resend OTP" });
  }

  try {
    const user = await User.findOne({ email });
    if (!user)
      return res.status(404).json({ message: "User not found" });

    if (user.status !== "approved")
      return res.status(403).json({ message: "Account not approved yet" });

    const otp = generateOTP();

    await redis.set(
      `user:loginOtp:${email}`,
      JSON.stringify({ otp }),
      "EX",
      10 * 60
    );

    try {
      await emailQueue.add("userLoginOtp", {
        to: email,
        subject: "FinoQz Login OTP",
        html: signinOtpTemplate({ otp }),
      });
    } catch (queueErr) {
      console.error("❌ Queue error (resend OTP):", queueErr);
    }

    await logActivity({
      req,
      actorType: "user",
      actorId: user._id,
      action: "login_otp_resent",
      meta: {
        email,
        device: getDeviceInfo(req)
      }
    });

    return res.json({
      message: "OTP resent to email",
    });

  } catch (err) {
    console.error("Resend OTP error:", err);
    return res.status(500).json({ message: "Server error during OTP resend" });
  }
};