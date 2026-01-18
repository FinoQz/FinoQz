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
const { emitDashboardStats } = require('./adminPanelController');


const isProd = process.env.NODE_ENV === 'production';

const sha256Hex = (input) =>
  crypto.createHash('sha256').update(String(input || '')).digest('hex');

const getLoginId = (req) =>
  req.body.email || req.body.identifier || req.cookies?.pendingAdminEmail;

// ✅ Login: Generate OTP, store in Redis, send email
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
      sameSite: isProd ? 'None' : 'Lax',
      path: '/',
      maxAge: 5 * 60 * 1000,
    });

    res.json({ message: 'OTP sent to email' });
  } catch (err) {
    console.error('❌ Admin login error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// ✅ Verify OTP, issue tokens, set cookies, log activity, track live user
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

    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }

    const storedOtp = await redis.get(`admin:otp:${admin._id}`);
    if (!storedOtp || storedOtp !== otp) {
      return res.status(403).json({ message: 'Invalid or expired OTP' });
    }

    await redis.del(`admin:otp:${admin._id}`);
    admin.lastLoginAt = new Date();
    await admin.save();

    const ip = req.ip || req.connection?.remoteAddress || '';
    const userAgent = req.get('user-agent') || '';
    const fingerprint = sha256Hex(`${ip}|${userAgent}`);

    const accessToken = jwt.sign(
      {
        _id: admin._id,
        role: admin.role,
        email: admin.email,
        fingerprint,
      },
      process.env.JWT_SECRET,
      { expiresIn: '30m' }
    );

    const refreshToken = jwt.sign(
      { _id: admin._id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    await redis.set(`session:${admin._id}`, accessToken, 'EX', 30 * 60);
    await redis.set(`admin:refresh:${admin._id}`, refreshToken, 'EX', 7 * 24 * 60 * 60);
    await redis.incr('liveUserCount');

    const cookieOptions = {
      secure: true, // ✅ always true for cross-origin cookies
      sameSite: 'None', // ✅ required for cross-origin + credentials
      path: '/',
    };


    res.cookie('adminToken', accessToken, {
      ...cookieOptions,
      httpOnly: true,
      maxAge: 30 * 60 * 1000,
    });

    res.cookie('adminRefresh', refreshToken, {
      ...cookieOptions,
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.cookie('adminSessionVisible', 'true', {
      httpOnly: false,         // ✅ middleware can read it
      secure: true,
      sameSite: 'None',
      path: '/',
      domain: '.finoqz.com',   // ✅ shared across finoqz.com and api.finoqz.com
      maxAge: 30 * 60 * 1000,
    });

    console.log('✅ Cookie set: adminSessionVisible', res.getHeader('Set-Cookie'));




    res.clearCookie('pendingAdminEmail', {
      ...cookieOptions,
      httpOnly: true,
      domain: '.finoqz.com',
    });

    await emitDashboardStats(req);

    await logActivity({
      req,
      actorType: 'admin',
      actorId: admin._id,
      action: 'login_success',
      meta: { loginId },
    });
    try {
      const html = loginAlertTemplate({
        name: admin.name || admin.username,
        ip,
        userAgent,
        time: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
      });

      await emailQueue.add('loginAlert', {
        to: admin.email,
        subject: '🔐 Admin Login Alert',
        html,
      });

      console.log('📨 Login alert job added to queue for:', admin.email);
    } catch (emailErr) {
      console.error('❌ Failed to queue login alert email:', emailErr);
    }


    res.json({
      message: 'OTP verified',
      token: accessToken,
      refreshToken,
      success: true,
    });
  } catch (err) {
    console.error('❌ Verify OTP error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};


// ✅ Refresh token → issue new access token
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
      sameSite: isProd ? 'None' : 'Lax',
      path: '/',
      maxAge: 30 * 60 * 1000,
    });

    res.json({ message: 'Token refreshed', token: newAccessToken });
  } catch (err) {
    console.error('❌ Refresh token error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// 📧 Get pending email from cookie
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

// 🚪 Logout admin, clear cookies, delete tokens, update live user count
exports.logout = async (req, res) => {
  try {
    const token = req.cookies?.adminToken;

    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET, {
          ignoreExpiration: true,
        });

        // 🔐 Clear session and refresh tokens from Redis
        await Promise.all([
          redis.del(`admin:refresh:${decoded._id}`),
          redis.del(`session:${decoded._id}`),
        ]);

        // 📉 Safely decrement live user count
        const currentCount = parseInt(await redis.get('liveUserCount')) || 0;
        if (currentCount > 0) {
          await redis.set('liveUserCount', currentCount - 1);
        }
      } catch (err) {
        console.warn('⚠️ Failed to decode token during logout:', err.message);
      }
    }

    const isProd = process.env.NODE_ENV === 'production';

    // 🧹 Clear all relevant cookies
    res.clearCookie('adminToken', {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? 'None' : 'Lax',
      path: '/',
    });

    res.clearCookie('adminRefresh', {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? 'None' : 'Lax',
      path: '/',
    });

    res.clearCookie('pendingAdminEmail', {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? 'None' : 'Lax',
      path: '/',
    });

    res.status(200).json({ message: 'Logged out successfully' });
  } catch (err) {
    console.error('❌ Logout error:', err);
    res.status(500).json({ message: 'Logout failed' });
  }
};
