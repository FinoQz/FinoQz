// // controllers/adminAuthController.js
// const Admin = require('../models/Admin');
// const bcrypt = require('bcrypt');
// const jwt = require('jsonwebtoken');
// const generateOTP = require('../utils/generateOTP');
// const getDeviceInfo = require('../utils/getDeviceInfo');
// const otpTemplate = require('../emailTemplates/otpTemplate');
// const loginAlertTemplate = require('../emailTemplates/loginAlertTemplate');
// const redis = require('../utils/redis');
// const emailQueue = require('../utils/emailQueue');
// const logActivity = require('../utils/logActivity');
// const crypto = require('crypto');

// // ✅ Step 1: Admin login → generate OTP
// // exports.login = async (req, res) => {
// //   try {
// //     const { identifier, password } = req.body;

// //     if (!identifier || !password) {
// //       return res.status(400).json({ message: 'Identifier and password required' });
// //     }

// //     const admin = await Admin.findOne({
// //       $or: [{ email: identifier }, { username: identifier }],
// //     });

// //     if (!admin) {
// //       return res.status(401).json({ message: 'Invalid credentials' });
// //     }

// //     const isMatch = await bcrypt.compare(password, admin.password);
// //     if (!isMatch) {
// //       return res.status(401).json({ message: 'Invalid credentials' });
// //     }

// //     const otp = generateOTP();

// //     // ✅ Store OTP in Redis (5 minutes)
// //     await redis.set(`admin:otp:${admin._id}`, otp, 'EX', 300);

// //     // ✅ Queue OTP email
// //     await emailQueue.add('sendOtp', {
// //       to: admin.email,
// //       subject: 'FinoQz Admin OTP',
// //       html: otpTemplate(otp),
// //     });

// //     return res.json({ message: 'OTP sent to email' });
// //   } catch (err) {
// //     console.error('❌ Admin login error:', err);
// //     return res.status(500).json({ message: 'Internal server error' });
// //   }
// // };
// // ✅ Step 1: Admin login → generate OTP
// exports.login = async (req, res) => {
//   try {
//     const { identifier, password } = req.body;

//     if (!identifier || !password) {
//       return res.status(400).json({ message: 'Identifier and password required' });
//     }

//     const admin = await Admin.findOne({
//       $or: [{ email: identifier }, { username: identifier }],
//     });

//     if (!admin) {
//       return res.status(401).json({ message: 'Invalid credentials' });
//     }

//     const isMatch = await bcrypt.compare(password, admin.password);
//     if (!isMatch) {
//       return res.status(401).json({ message: 'Invalid credentials' });
//     }

//     const otp = generateOTP();

//     // ✅ Store OTP in Redis (5 minutes)
//     await redis.set(`admin:otp:${admin._id}`, otp, 'EX', 300);

//     // ✅ Queue OTP email
//     await emailQueue.add('sendOtp', {
//       to: admin.email,
//       subject: 'FinoQz Admin OTP',
//       html: otpTemplate(otp),
//     });

//     // ✅ Set pendingAdminEmail in HTTP-only cookie
//     res.cookie('pendingAdminEmail', identifier, {
//       httpOnly: true,
//       secure: process.env.NODE_ENV === 'production',
//       sameSite: 'strict',
//       path: '/',
//       expires: new Date(Date.now() + 5 * 60 * 1000), // ✅ 5 minutes from now
//     });


//     return res.json({ message: 'OTP sent to email' });
//   } catch (err) {
//     console.error('❌ Admin login error:', err);
//     return res.status(500).json({ message: 'Internal server error' });
//   }
// };


// function sha256Hex(input) {
//   return crypto.createHash("sha256").update(String(input || "")).digest("hex");
// }

// // exports.verifyOtp = async (req, res) => {
// //   try {
// //     const { email, identifier, otp } = req.body;

// //     const loginId = email || identifier;
// //     if (!loginId || !otp) {
// //       return res.status(400).json({ message: "Email/username and OTP required" });
// //     }

// //     const admin = await Admin.findOne({
// //       $or: [{ email: loginId }, { username: loginId }],
// //     });

// //     if (!admin) {
// //       return res.status(403).json({ message: "Invalid admin" });
// //     }

// //     const storedOtp = await redis.get(`admin:otp:${admin._id}`);
// //     if (!storedOtp || storedOtp !== otp) {
// //       return res.status(403).json({ message: "Invalid or expired OTP" });
// //     }

// //     // ✅ Debug logs
// //     console.log("OTP verify start:", { loginId, otp });
// //     console.log("Admin found:", admin && admin._id);
// //     console.log("Stored OTP:", storedOtp);
// //     console.log("JWT_SECRET:", process.env.JWT_SECRET);

// //     // ✅ Clear OTP
// //     await redis.del(`admin:otp:${admin._id}`);

// //     admin.lastLoginAt = new Date();
// //     await admin.save();

// //     // ✅ Generate fingerprint (hashed ip + user-agent)
// //     const ip = req.ip || req.connection?.remoteAddress || "";
// //     const userAgent = req.get("user-agent") || "";
// //     const fingerprint = sha256Hex(ip + "|" + userAgent);

// //     // ✅ Generate secure Access Token (short-lived)
// //     const accessToken = jwt.sign(
// //       {
// //         id: admin._id,
// //         role: admin.role || "admin",
// //         fingerprint,
// //       },
// //       process.env.JWT_SECRET,
// //       { expiresIn: "30m" }
// //     );

// //     // ✅ Generate Refresh Token (long-lived)
// //     const refreshToken = jwt.sign(
// //       { id: admin._id },
// //       process.env.JWT_SECRET,
// //       { expiresIn: "7d" }
// //     );

// //     // ✅ Store refresh token in Redis (7 days)
// //     await redis.set(`admin:refresh:${admin._id}`, refreshToken, "EX", 7 * 24 * 60 * 60);

// //     // ✅ Set tokens in HTTP-only cookies
// //     res.cookie("adminToken", accessToken, {
// //       httpOnly: true,
// //       secure: process.env.NODE_ENV === "production", // ⚠️ dev में false
// //       sameSite: "strict",
// //       path: "/",
// //       maxAge: 30 * 60 * 1000,
// //     });

// //     res.cookie("adminRefresh", refreshToken, {
// //       httpOnly: true,
// //       secure: process.env.NODE_ENV === "production",
// //       sameSite: "strict",
// //       path: "/",
// //       maxAge: 7 * 24 * 60 * 60 * 1000,
// //     });

// //     // ✅ Login alert email + activity log
// //     const info = getDeviceInfo(req);
// //     const alertRecipients = [admin.email, process.env.ADMIN_ALERT_EMAIL].filter(Boolean);

// //     await emailQueue.add("loginAlert", {
// //       to: alertRecipients,
// //       subject: "Admin Panel Accessed",
// //       html: loginAlertTemplate(info),
// //     });

// //     await logActivity({
// //       req,
// //       actorType: "admin",
// //       actorId: admin._id,
// //       action: "login_success",
// //       meta: { loginId },
// //     });

// //     return res.json({
// //       message: "OTP verified",
// //       token: accessToken,
// //       refreshToken,
// //     });
// //   } catch (err) {
// //     console.error("❌ Verify OTP error:", err);
// //     return res.status(500).json({ message: "Internal server error" });
// //   }
// // };



// // ✅ Step 3: Refresh token → issue new access token
// // exports.refreshToken = async (req, res) => {
// //   try {
// //     const oldToken = req.cookies?.adminToken || req.headers["authorization"]?.split(" ")[1];
// //     if (!oldToken) {
// //       return res.status(401).json({ message: "No token provided" });
// //     }

// //     let decoded;
// //     try {
// //       decoded = jwt.verify(oldToken, process.env.JWT_SECRET, { ignoreExpiration: true });
// //     } catch (err) {
// //       return res.status(401).json({ message: "Invalid token" });
// //     }

// //     // ✅ Check Redis for refresh token
// //     const storedRefresh = await redis.get(`admin:refresh:${decoded.id}`);
// //     if (!storedRefresh) {
// //       return res.status(403).json({ message: "Refresh token expired or invalid" });
// //     }

// //     // ✅ Generate new access token
// //     const newAccessToken = jwt.sign(
// //       {
// //         id: decoded.id,
// //         role: decoded.role || "admin",
// //         fingerprint: decoded.fingerprint
// //       },
// //       process.env.JWT_SECRET,
// //       { expiresIn: "30m" }
// //     );

// //     // ✅ Reset cookie
// //     res.cookie("adminToken", newAccessToken, {
// //       httpOnly: true,
// //       secure: true,
// //       sameSite: "strict",
// //       path: "/",
// //       maxAge: 30 * 60 * 1000
// //     });

// //     return res.json({ token: newAccessToken });
// //   } catch (err) {
// //     console.error("❌ Refresh token error:", err);
// //     return res.status(500).json({ message: "Internal server error" });
// //   }
// // };
// exports.verifyOtp = async (req, res) => {
//   try {
//     const { email, identifier, otp } = req.body;

//     // ✅ Fallback to cookie if email/identifier not sent
//     const loginId = email || identifier || req.cookies?.pendingAdminEmail;

//     if (!loginId || !otp) {
//       return res.status(400).json({ message: "Email/username and OTP required" });
//     }

//     const admin = await Admin.findOne({
//       $or: [{ email: loginId }, { username: loginId }],
//     });

//     if (!admin) {
//       return res.status(403).json({ message: "Invalid admin" });
//     }

//     const storedOtp = await redis.get(`admin:otp:${admin._id}`);
//     if (!storedOtp || storedOtp !== otp) {
//       return res.status(403).json({ message: "Invalid or expired OTP" });
//     }

//     // ✅ Clear OTP
//     await redis.del(`admin:otp:${admin._id}`);

//     admin.lastLoginAt = new Date();
//     await admin.save();

//     const ip = req.ip || req.connection?.remoteAddress || "";
//     const userAgent = req.get("user-agent") || "";
//     const fingerprint = sha256Hex(ip + "|" + userAgent);

//     const accessToken = jwt.sign(
//       {
//         id: admin._id,
//         role: admin.role || "admin",
//         fingerprint,
//       },
//       process.env.JWT_SECRET,
//       { expiresIn: "30m" }
//     );

//     const refreshToken = jwt.sign(
//       { id: admin._id },
//       process.env.JWT_SECRET,
//       { expiresIn: "7d" }
//     );

//     await redis.set(`admin:refresh:${admin._id}`, refreshToken, "EX", 7 * 24 * 60 * 60);

//     const isProd = process.env.NODE_ENV === "production";

//     res.cookie("adminToken", accessToken, {
//       httpOnly: true,
//       secure: isProd,
//       sameSite: "strict",
//       path: "/",
//       maxAge: 30 * 60 * 1000,
//     });


//     res.cookie("adminRefresh", refreshToken, {
//       httpOnly: true,
//       secure: isProd,
//       sameSite: "strict",
//       path: "/",
//       maxAge: 7 * 24 * 60 * 60 * 1000,
//     });

//     // ✅ Clear pending email cookie after successful login
//     res.clearCookie("pendingAdminEmail", {
//       httpOnly: true,
//       secure: process.env.NODE_ENV === "production",
//       sameSite: "strict",
//       path: "/",
//     });

//     const info = getDeviceInfo(req);
//     const alertRecipients = [admin.email, process.env.ADMIN_ALERT_EMAIL].filter(Boolean);

//     await emailQueue.add("loginAlert", {
//       to: alertRecipients,
//       subject: "Admin Panel Accessed",
//       html: loginAlertTemplate(info),
//     });

//     await logActivity({
//       req,
//       actorType: "admin",
//       actorId: admin._id,
//       action: "login_success",
//       meta: { loginId },
//     });

//     return res.json({
//       message: "OTP verified",
//       token: accessToken,
//       refreshToken,
//     });
//   } catch (err) {
//     console.error("❌ Verify OTP error:", err);
//     return res.status(500).json({ message: "Internal server error" });
//   }
// };

// exports.refreshToken = async (req, res) => {
//   try {
//     const oldToken = req.cookies?.adminToken || req.headers["authorization"]?.split(" ")[1];
//     if (!oldToken) {
//       return res.status(401).json({ message: "No token provided" });
//     }

//     let decoded;
//     try {
//       decoded = jwt.verify(oldToken, process.env.JWT_SECRET, { ignoreExpiration: true });
//     } catch (err) {
//       console.warn("❌ Invalid token during refresh:", err.message);
//       return res.status(401).json({ message: "Invalid token" });
//     }

//     // ✅ Check Redis for refresh token
//     const storedRefresh = await redis.get(`admin:refresh:${decoded.id}`);
//     if (!storedRefresh) {
//       console.warn("❌ No refresh token found in Redis");
//       return res.status(403).json({ message: "Refresh token expired or invalid" });
//     }

//     // ✅ Generate new access token
//     const now = Math.floor(Date.now() / 1000);
//     const expiresInSeconds = 30 * 60;

//     const newAccessToken = jwt.sign(
//       {
//         id: decoded.id,
//         role: decoded.role || "admin",
//         fingerprint: decoded.fingerprint,
//         iat: now,
//       },
//       process.env.JWT_SECRET,
//       { expiresIn: expiresInSeconds }
//     );

//     // ✅ Update Redis session
//     await redis.set(`session:${decoded.id}`, newAccessToken, "EX", expiresInSeconds);

//     // ✅ Reset cookie
//     res.cookie("adminToken", newAccessToken, {
//       httpOnly: true,
//       secure: process.env.NODE_ENV === "production",
//       sameSite: "strict",
//       path: "/",
//       maxAge: expiresInSeconds * 1000,
//     });

//     return res.json({ message: "Token refreshed", token: newAccessToken });
//   } catch (err) {
//     console.error("❌ Refresh token error:", err);
//     return res.status(500).json({ message: "Internal server error" });
//   }
// };

// exports.getPendingEmail = (req, res) => {
//   const email = req.cookies?.pendingAdminEmail;
//   if (!email) {
//     return res.status(404).json({ message: "No pending email found" });
//   }
//   return res.json({ email });
// };

// exports.resendOtp = async (req, res) => {
//   try {
//     const { email, identifier } = req.body;

//     // ✅ Fallback to cookie if not provided
//     const loginId = email || identifier || req.cookies?.pendingAdminEmail;

//     if (!loginId) {
//       return res.status(400).json({ message: "Missing email or identifier" });
//     }

//     const admin = await Admin.findOne({
//       $or: [{ email: loginId }, { username: loginId }],
//     });

//     if (!admin) {
//       return res.status(404).json({ message: "Admin not found" });
//     }

//     const otp = generateOTP();

//     // ✅ Store new OTP in Redis
//     await redis.set(`admin:otp:${admin._id}`, otp, 'EX', 300);

//     // ✅ Queue OTP email
//     await emailQueue.add('sendOtp', {
//       to: admin.email,
//       subject: 'FinoQz Admin OTP (Resent)',
//       html: otpTemplate(otp),
//     });

//     return res.json({ message: "OTP resent to email" });
//   } catch (err) {
//     console.error("❌ Resend OTP error:", err);
//     return res.status(500).json({ message: "Failed to resend OTP" });
//   }
// };
const Admin = require('../models/Admin');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const redis = require('../utils/redis');
const generateOTP = require('../utils/generateOTP');
const getDeviceInfo = require('../utils/getDeviceInfo');
const otpTemplate = require('../emailTemplates/otpTemplate');
const loginAlertTemplate = require('../emailTemplates/loginAlertTemplate');
const emailQueue = require('../utils/emailQueue');
const logActivity = require('../utils/logActivity');

const isProd = process.env.NODE_ENV === 'production'; // ✅ Define isProd

const sha256Hex = (input) =>
  crypto.createHash('sha256').update(String(input || '')).digest('hex');

const getLoginId = (req) =>
  req.body.email || req.body.identifier || req.cookies?.pendingAdminEmail;

// 🔐 Admin Login
// exports.login = async (req, res) => {
//   try {
//     const { identifier, password } = req.body;

//     if (!identifier || !password) {
//       return res.status(400).json({ message: 'Identifier and password required' });
//     }

//     const admin = await Admin.findOne({
//       $or: [
//         { email: identifier.toLowerCase() },
//         { username: identifier },
//       ],
//     });

//     if (!admin) {
//       console.warn('❌ Admin not found for identifier:', identifier);
//       return res.status(401).json({ message: 'Invalid credentials' });
//     }

//     const isMatch = await bcrypt.compare(password, admin.password);
//     if (!isMatch) {
//       console.warn('❌ Password mismatch for admin:', admin.email);
//       return res.status(401).json({ message: 'Invalid credentials' });
//     }

//     const otp = generateOTP();
//     await redis.set(`admin:otp:${admin._id}`, otp, 'EX', 300); // 5 minutes

//     await emailQueue.add('sendOtp', {
//       to: admin.email,
//       subject: 'FinoQz Admin OTP',
//       html: otpTemplate(otp),
//     });

//     res.cookie('pendingAdminEmail', identifier, {
//       httpOnly: true,
//       secure: isProd,
//       sameSite: 'strict',
//       path: '/',
//       maxAge: 5 * 60 * 1000,
//     });

//     return res.json({ message: 'OTP sent to email' });
//   } catch (err) {
//     console.error('❌ Admin login error:', err);
//     return res.status(500).json({ message: 'Internal server error' });
//   }
// };
exports.login = async (req, res) => {
  try {
    const { identifier, password } = req.body;
    if (!identifier || !password) {
      return res.status(400).json({ message: 'Identifier and password required' });
    }

    const admin = await Admin.findOne({
      $or: [{ email: identifier.toLowerCase() }, { username: identifier }],
    });

    if (!admin || !(await bcrypt.compare(password, admin.password))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const otp = generateOTP();
    await redis.set(`admin:otp:${admin._id}`, otp, 'EX', 300); // 5 min

    await emailQueue.add('sendOtp', {
      to: admin.email,
      subject: 'FinoQz Admin OTP',
      html: otpTemplate(otp),
    });

    res.cookie('pendingAdminEmail', identifier, {
      httpOnly: true,
      secure: isProd,
      sameSite: 'strict',
      path: '/',
      maxAge: 5 * 60 * 1000,
    });

    res.json({ message: 'OTP sent to email' });
  } catch (err) {
    console.error('❌ Admin login error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};


// ✅ OTP Verification
// exports.verifyOtp = async (req, res) => {
//   try {
//     const loginId = getLoginId(req);
//     const { otp } = req.body;

//     if (!loginId || !otp) {
//       return res.status(400).json({ message: 'Email/username and OTP required' });
//     }

//     const admin = await Admin.findOne({
//       $or: [{ email: loginId.toLowerCase() }, { username: loginId }],
//     });

//     if (!admin) {
//       return res.status(403).json({ message: 'Invalid admin' });
//     }

//     const storedOtp = await redis.get(`admin:otp:${admin._id}`);
//     if (!storedOtp || storedOtp !== otp) {
//       return res.status(403).json({ message: 'Invalid or expired OTP' });
//     }

//     await redis.del(`admin:otp:${admin._id}`);

//     admin.lastLoginAt = new Date();
//     await admin.save();

//     const ip = req.ip || req.connection?.remoteAddress || '';
//     const userAgent = req.get('user-agent') || '';
//     const fingerprint = sha256Hex(ip + '|' + userAgent);

//     const accessToken = jwt.sign(
//       {
//         _id: admin._id,
//         role: admin.role,
//         fingerprint,
//       },
//       process.env.JWT_SECRET,
//       { expiresIn: '30m' }
//     );

//     const refreshToken = jwt.sign({ _id: admin._id }, process.env.JWT_SECRET, {
//       expiresIn: '7d',
//     });

//     await redis.set(`admin:refresh:${admin._id}`, refreshToken, 'EX', 7 * 24 * 60 * 60);

//     res.cookie('adminToken', accessToken, {
//       httpOnly: true,
//       secure: isProd,
//       sameSite: 'strict',
//       path: '/',
//       maxAge: 30 * 60 * 1000,
//     });

//     res.cookie('adminRefresh', refreshToken, {
//       httpOnly: true,
//       secure: isProd,
//       sameSite: 'strict',
//       path: '/',
//       maxAge: 7 * 24 * 60 * 60 * 1000,
//     });

//     res.clearCookie('pendingAdminEmail', {
//       httpOnly: true,
//       secure: isProd,
//       sameSite: 'strict',
//       path: '/',
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
//       meta: { loginId },
//     });

//     return res.json({
//       message: 'OTP verified',
//       token: accessToken,
//       refreshToken,
//     });
//   } catch (err) {
//     console.error('❌ Verify OTP error:', err);
//     return res.status(500).json({ message: 'Internal server error' });
//   }
// };
exports.verifyOtp = async (req, res) => {
  try {
    const loginId = getLoginId(req);
    const { otp } = req.body;

    if (!loginId || !otp) {
      return res.status(400).json({ message: 'Email/username and OTP required' });
    }

    const admin = await Admin.findOne({
      $or: [{ email: loginId.toLowerCase() }, { username: loginId }],
    });

    const storedOtp = await redis.get(`admin:otp:${admin._id}`);
    if (!storedOtp || storedOtp !== otp) {
      return res.status(403).json({ message: 'Invalid or expired OTP' });
    }

    await redis.del(`admin:otp:${admin._id}`);
    admin.lastLoginAt = new Date();
    await admin.save();

    const ip = req.ip || req.connection?.remoteAddress || '';
    const userAgent = req.get('user-agent') || '';
    const fingerprint = sha256Hex(ip + '|' + userAgent);

    const accessToken = jwt.sign(
      { _id: admin._id, role: admin.role, fingerprint },
      process.env.JWT_SECRET,
      { expiresIn: '30m' }
    );

    const refreshToken = jwt.sign({ _id: admin._id }, process.env.JWT_SECRET, {
      expiresIn: '7d',
    });

    await redis.set(`session:${admin._id}`, accessToken, 'EX', 30 * 60);
    await redis.set(`admin:refresh:${admin._id}`, refreshToken, 'EX', 7 * 24 * 60 * 60);
    

    res.cookie('adminToken', accessToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: 'strict',
      path: '/',
      maxAge: 30 * 60 * 1000,
    });

    res.cookie('adminRefresh', refreshToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: 'strict',
      path: '/',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.clearCookie('pendingAdminEmail', {
      httpOnly: true,
      secure: isProd,
      sameSite: 'strict',
      path: '/',
    });

    await logActivity({
      req,
      actorType: 'admin',
      actorId: admin._id,
      action: 'login_success',
      meta: { loginId },
    });

    res.json({ message: 'OTP verified', token: accessToken, refreshToken });
  } catch (err) {
    console.error('❌ Verify OTP error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};


// 🔁 Refresh Token
// exports.refreshToken = async (req, res) => {
//   try {
//     const oldToken =
//       req.cookies?.adminToken || req.headers['authorization']?.split(' ')[1];
//     if (!oldToken) {
//       return res.status(401).json({ message: 'No token provided' });
//     }

//     let decoded;
//     try {
//       decoded = jwt.verify(oldToken, process.env.JWT_SECRET, {
//         ignoreExpiration: true,
//       });
//     } catch (err) {
//       console.warn('❌ Invalid token during refresh:', err.message);
//       return res.status(401).json({ message: 'Invalid token' });
//     }

//     const storedRefresh = await redis.get(`admin:refresh:${decoded._id}`);
//     if (!storedRefresh) {
//       return res.status(403).json({ message: 'Refresh token expired or invalid' });
//     }

//     const now = Math.floor(Date.now() / 1000);
//     const expiresInSeconds = 30 * 60;

//     const newAccessToken = jwt.sign(
//       {
//         _id: decoded._id,
//         role: decoded.role,
//         fingerprint: decoded.fingerprint,
//         iat: now,
//       },
//       process.env.JWT_SECRET,
//       { expiresIn: expiresInSeconds }
//     );

//     await redis.set(`session:${decoded._id}`, newAccessToken, 'EX', expiresInSeconds);

//     res.cookie('adminToken', newAccessToken, {
//       httpOnly: true,
//       secure: isProd,
//       sameSite: 'strict',
//       path: '/',
//       maxAge: expiresInSeconds * 1000,
//     });

//     return res.json({ message: 'Token refreshed', token: newAccessToken });
//   } catch (err) {
//     console.error('❌ Refresh token error:', err);
//     return res.status(500).json({ message: 'Internal server error' });
//   }
// };
exports.refreshToken = async (req, res) => {
  try {
    const refreshToken = req.cookies?.adminRefresh;
    if (!refreshToken) {
      return res.status(401).json({ message: 'No refresh token provided' });
    }

    let decoded;
    try {
      decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);
    } catch (err) {
      console.warn('❌ Invalid refresh token:', err.message);
      return res.status(401).json({ message: 'Invalid or expired refresh token' });
    }

    const storedRefresh = await redis.get(`admin:refresh:${decoded._id}`);
    if (!storedRefresh || storedRefresh !== refreshToken) {
      return res.status(403).json({ message: 'Refresh token expired or invalid' });
    }

    const ip = req.ip || req.connection?.remoteAddress || '';
    const userAgent = req.get('user-agent') || '';
    const fingerprint = sha256Hex(ip + '|' + userAgent);

    const newAccessToken = jwt.sign(
      {
        _id: decoded._id,
        role: 'admin',
        fingerprint,
      },
      process.env.JWT_SECRET,
      { expiresIn: '30m' }
    );

    await redis.set(`session:${decoded._id}`, newAccessToken, 'EX', 30 * 60);

    res.cookie('adminToken', newAccessToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: 'strict',
      path: '/',
      maxAge: 30 * 60 * 1000,
    });

    res.json({ message: 'Token refreshed', token: newAccessToken });
  } catch (err) {
    console.error('❌ Refresh token error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// 📩 Get Pending Email
exports.getPendingEmail = (req, res) => {
  const email = req.cookies?.pendingAdminEmail;
  if (!email) {
    return res.status(404).json({ message: 'No pending email found' });
  }
  return res.json({ email });
};

// 🔁 Resend OTP
exports.resendOtp = async (req, res) => {
  try {
    const loginId =
      req.body.email || req.body.identifier || req.cookies?.pendingAdminEmail;

    if (!loginId) {
      return res.status(400).json({ message: 'Missing email or identifier' });
    }

    const admin = await Admin.findOne({
      $or: [{ email: loginId.toLowerCase() }, { username: loginId }],
    });

    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }

    const otp = generateOTP();

    await redis.set(`admin:otp:${admin._id}`, otp, 'EX', 300);

    await emailQueue.add('sendOtp', {
      to: admin.email,
      subject: 'FinoQz Admin OTP (Resent)',
      html: otpTemplate(otp),
    });

    return res.json({ message: 'OTP resent to email' });
  } catch (err) {
    console.error('❌ Resend OTP error:', err);
    return res.status(500).json({ message: 'Failed to resend OTP' });
  }
};

// 🚪 Admin Logout
// exports.logout = async (req, res) => {
//   try {
//     const token = req.cookies?.adminToken;
//     let decoded;

//     if (token) {
//       try {
//         decoded = jwt.verify(token, process.env.JWT_SECRET, {
//           ignoreExpiration: true,
//         });

//         // ❌ Delete refresh token from Redis
//         await redis.del(`admin:refresh:${decoded._id}`);
//       } catch (err) {
//         console.warn('⚠️ Failed to decode token during logout:', err.message);
//       }
//     }

//     // 🧹 Clear all relevant cookies
//     res.clearCookie('adminToken', {
//       httpOnly: true,
//       secure: isProd,
//       sameSite: 'strict',
//       path: '/',
//     });

//     res.clearCookie('adminRefresh', {
//       httpOnly: true,
//       secure: isProd,
//       sameSite: 'strict',
//       path: '/',
//     });

//     res.clearCookie('pendingAdminEmail', {
//       httpOnly: true,
//       secure: isProd,
//       sameSite: 'strict',
//       path: '/',
//     });

//     return res.status(200).json({ message: 'Logged out successfully' });
//   } catch (err) {
//     console.error('❌ Logout error:', err);
//     return res.status(500).json({ message: 'Logout failed' });
//   }
// };
exports.logout = async (req, res) => {
  try {
    const token = req.cookies?.adminToken;
    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET, {
          ignoreExpiration: true,
        });

        await redis.del(`admin:refresh:${decoded._id}`);
        await redis.del(`session:${decoded._id}`);
      } catch (err) {
        console.warn('⚠️ Failed to decode token during logout:', err.message);
      }
    }

    res.clearCookie('adminToken', {
      httpOnly: true,
      secure: isProd,
      sameSite: 'strict',
      path: '/',
    });

    res.clearCookie('adminRefresh', {
      httpOnly: true,
      secure: isProd,
      sameSite: 'strict',
      path: '/',
    });

    res.clearCookie('pendingAdminEmail', {
      httpOnly: true,
      secure: isProd,
      sameSite: 'strict',
      path: '/',
    });

    res.status(200).json({ message: 'Logged out successfully' });
  } catch (err) {
    console.error('❌ Logout error:', err);
    res.status(500).json({ message: 'Logout failed' });
  }
};
