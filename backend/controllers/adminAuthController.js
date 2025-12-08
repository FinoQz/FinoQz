// controllers/adminAuthController.js
const Admin = require('../models/Admin');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const generateOTP = require('../utils/generateOTP');
const getDeviceInfo = require('../utils/getDeviceInfo');
const otpTemplate = require('../emailTemplates/otpTemplate');
const loginAlertTemplate = require('../emailTemplates/loginAlertTemplate');
const redis = require('../utils/redis');
const emailQueue = require('../utils/emailQueue');
const logActivity = require('../utils/logActivity');

// ✅ Step 1: Admin login → generate OTP
exports.login = async (req, res) => {
  try {
    const { identifier, password } = req.body;

    if (!identifier || !password) {
      return res.status(400).json({ message: 'Identifier and password required' });
    }

    const admin = await Admin.findOne({
      $or: [{ email: identifier }, { username: identifier }],
    });

    if (!admin) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const otp = generateOTP();

    // ✅ Store OTP in Redis (5 minutes)
    await redis.set(`admin:otp:${admin._id}`, otp, 'EX', 300);

    // ✅ Queue OTP email
    await emailQueue.add('sendOtp', {
      to: admin.email,
      subject: 'FinoQz Admin OTP',
      html: otpTemplate(otp),
    });

    return res.json({ message: 'OTP sent to email' });
  } catch (err) {
    console.error('❌ Admin login error:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};


// ✅ Step 2: Verify OTP → issue JWT + send login alert
exports.verifyOtp = async (req, res) => {
  try {
    const { email, identifier, otp } = req.body;

    const loginId = email || identifier;
    if (!loginId || !otp) {
      return res.status(400).json({ message: 'Email/username and OTP required' });
    }

    const admin = await Admin.findOne({
      $or: [{ email: loginId }, { username: loginId }],
    });

    if (!admin) {
      return res.status(403).json({ message: 'Invalid admin' });
    }

    const storedOtp = await redis.get(`admin:otp:${admin._id}`);
    if (!storedOtp || storedOtp !== otp) {
      return res.status(403).json({ message: 'Invalid or expired OTP' });
    }

    // ✅ Clear OTP
    await redis.del(`admin:otp:${admin._id}`);

    admin.lastLoginAt = new Date();
    await admin.save();

    // ✅ Generate fingerprint (IP + device)
    const fingerprint = req.ip + req.headers["user-agent"];

    // ✅ Generate secure JWT
    const token = jwt.sign(
      {
        id: admin._id,
        role: admin.role || "admin",
        fingerprint
      },
      process.env.JWT_SECRET,
      { expiresIn: "30m" }
    );

    // ✅ Set token in HTTP-only cookie (middleware reads this)
    res.cookie("adminToken", token, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      path: "/",
      maxAge: 30 * 60 * 1000 // 30 minutes
    });

    // ✅ Login alert email
    const info = getDeviceInfo(req);
    const alertRecipients = [
      admin.email,
      process.env.ADMIN_ALERT_EMAIL,
    ].filter(Boolean);

    await emailQueue.add("loginAlert", {
      to: alertRecipients,
      subject: "Admin Panel Accessed",
      html: loginAlertTemplate(info),
    });

    // ✅ Log admin login
    await logActivity({
      req,
      actorType: "admin",
      actorId: admin._id,
      action: "login_success",
      meta: { loginId }
    });

    return res.json({
      message: "OTP verified",
      token // ✅ frontend ke liye bhi return kar rahe hain
    });

  } catch (err) {
    console.error("❌ Verify OTP error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};
// const Admin = require('../models/Admin');
// const bcrypt = require('bcrypt');
// const jwt = require('jsonwebtoken');
// const crypto = require('crypto');
// const generateOTP = require('../utils/generateOTP');
// const getDeviceInfo = require('../utils/getDeviceInfo');
// const otpTemplate = require('../emailTemplates/otpTemplate');
// const loginAlertTemplate = require('../emailTemplates/loginAlertTemplate');
// const { redis } = require('../utils/redis');
// const emailQueue = require('../utils/emailQueue');
// const logActivity = require('../utils/logActivity');
// const logger = require('../utils/logger');

// // ✅ Step 1: Admin login → generate OTP
// exports.login = async (req, res) => {
//   try {
//     const { identifier, password } = req.body;
//     if (!identifier || !password) return res.status(400).json({ message: 'Identifier and password required' });

//     const admin = await Admin.findOne({ $or: [{ email: identifier }, { username: identifier }] });
//     if (!admin) return res.status(401).json({ message: 'Invalid credentials' });

//     const isMatch = await bcrypt.compare(password, admin.password);
//     if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

//     const otp = generateOTP();
//     await redis.set(`admin:otp:${admin._id}`, otp, 'EX', 300); // 5 min expiry

//     await emailQueue.add('sendOtp', {
//       to: admin.email,
//       subject: 'FinoQz Admin OTP',
//       html: otpTemplate(otp),
//     });

//     logger.info('OTP generated', { adminId: admin._id });
//     return res.json({ message: 'OTP sent to email' });
//   } catch (err) {
//     logger.error('Admin login error', { error: err.message });
//     return res.status(500).json({ message: 'Internal server error' });
//   }
// };

// // ✅ Step 2: Verify OTP → issue JWT + Refresh Token
// exports.verifyOtp = async (req, res) => {
//   try {
//     const { email, identifier, otp } = req.body;
//     const loginId = email || identifier;
//     if (!loginId || !otp) return res.status(400).json({ message: 'Email/username and OTP required' });

//     const admin = await Admin.findOne({ $or: [{ email: loginId }, { username: loginId }] });
//     if (!admin) return res.status(403).json({ message: 'Invalid admin' });

//     const storedOtp = await redis.get(`admin:otp:${admin._id}`);
//     if (!storedOtp || storedOtp !== otp) return res.status(403).json({ message: 'Invalid or expired OTP' });

//     await redis.del(`admin:otp:${admin._id}`);
//     admin.lastLoginAt = new Date();
//     await admin.save();

//     const fingerprint = crypto.createHash('sha256')
//       .update(req.ip + req.headers['user-agent'])
//       .digest('hex');

//     const accessToken = jwt.sign(
//       { id: admin._id, role: admin.role || 'admin', fingerprint },
//       process.env.JWT_SECRET,
//       { expiresIn: '30m' }
//     );

//     const refreshToken = jwt.sign(
//       { id: admin._id, role: admin.role || 'admin' },
//       process.env.JWT_REFRESH_SECRET,
//       { expiresIn: '7d' }
//     );

//     await redis.set(`admin:refresh:${admin._id}`, refreshToken, 'EX', 7 * 24 * 60 * 60);

//     res.cookie('adminToken', accessToken, {
//       httpOnly: true,
//       secure: process.env.NODE_ENV === 'production',
//       sameSite: 'strict',
//       path: '/',
//       maxAge: 30 * 60 * 1000
//     });

//     res.cookie('adminRefresh', refreshToken, {
//       httpOnly: true,
//       secure: process.env.NODE_ENV === 'production',
//       sameSite: 'strict',
//       path: '/',
//       maxAge: 7 * 24 * 60 * 60 * 1000
//     });

//     const info = getDeviceInfo(req);
//     const alertRecipients = [admin.email, process.env.ADMIN_ALERT_EMAIL].filter(Boolean);
//     await emailQueue.add('loginAlert', {
//       to: alertRecipients,
//       subject: 'Admin Panel Accessed',
//       html: loginAlertTemplate(info),
//     });

//     await logActivity({
//       req,
//       actorType: 'admin',
//       actorId: admin._id,
//       action: 'login_success',
//       meta: { loginId }
//     });

//     return res.json({ message: 'OTP verified', token: accessToken });
//   } catch (err) {
//     logger.error('Verify OTP error', { error: err.message });
//     return res.status(500).json({ message: 'Internal server error' });
//   }
// };

// // ✅ Step 3: Refresh Token → issue new Access Token
// exports.refreshToken = async (req, res) => {
//   try {
//     const refreshToken = req.cookies.adminRefresh || req.body.refreshToken;
//     if (!refreshToken) return res.status(401).json({ message: 'No refresh token provided' });

//     const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
//     const stored = await redis.get(`admin:refresh:${decoded.id}`);
//     if (!stored || stored !== refreshToken) return res.status(403).json({ message: 'Invalid refresh token' });

//     const fingerprint = crypto.createHash('sha256')
//       .update(req.ip + req.headers['user-agent'])
//       .digest('hex');

//     const newAccessToken = jwt.sign(
//       { id: decoded.id, role: decoded.role, fingerprint },
//       process.env.JWT_SECRET,
//       { expiresIn: '30m' }
//     );

//     res.cookie('adminToken', newAccessToken, {
//       httpOnly: true,
//       secure: process.env.NODE_ENV === 'production',
//       sameSite: 'strict',
//       path: '/',
//       maxAge: 30 * 60 * 1000
//     });

//     return res.json({ message: 'Token refreshed', token: newAccessToken });
//   } catch (err) {
//     logger.error('Refresh token error', { error: err.message });
//     return res.status(401).json({ message: 'Invalid or expired refresh token' });
//   }
// };
