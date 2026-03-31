import Admin from '../models/Admin.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import redis from '../utils/redis.js';
import generateOTP from '../utils/generateOTP.js';
import getDeviceInfo from '../utils/getDeviceInfo.js';
import otpTemplate from '../emailTemplates/otpTemplate.js';
import loginAlertTemplate from '../emailTemplates/loginAlertTemplate.js';
import emailQueue from '../utils/emailQueue.js';
import logActivity from '../utils/logActivity.js';
import { emitDashboardStats } from './adminPanelController.js';


const isProd = process.env.NODE_ENV === 'production';

const sha256Hex = (input) =>
  crypto.createHash('sha256').update(String(input || '')).digest('hex');

const getLoginId = (req) =>
  req.body.email || req.body.identifier || req.cookies?.pendingAdminEmail;

// ✅ Login: Generate OTP, store in Redis, send email
export const login = async (req, res) => {
  try {
    let { identifier, password } = req.body;

    if (!identifier || !password) {
      return res.status(400).json({
        message: 'Identifier and password required',
      });
    }

    identifier = identifier.trim();

    // Email lowercase, username unchanged
    const query = identifier.includes('@')
      ? { email: identifier.toLowerCase() }
      : { username: identifier };

    const admin = await Admin.findOne(query);

    if (!admin || !(await bcrypt.compare(password, admin.password))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // ✅ Generate OTP
    const otp = generateOTP();

    await redis.set(
      `admin:otp:${admin._id}`,
      otp,
      'EX',
      300 // 5 minutes
    );

    // ✅ Send OTP email
    await emailQueue.add('sendOtp', {
      to: admin.email,
      subject: 'FinoQz Admin OTP',
      html: otpTemplate(otp),
    });

    // ✅ Cookie options unified
    const cookieOptions = {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? 'None' : 'Lax',
      path: '/',
      maxAge: 5 * 60 * 1000,
      domain: isProd ? '.finoqz.com' : undefined,
    };

    // ✅ ALWAYS store real email (never masked)
    res.cookie('pendingAdminEmail', admin.email, cookieOptions);

    res.json({
      message: 'OTP sent to email',
      success: true,
    });

  } catch (err) {
    console.error('❌ Admin login error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};


// ✅ Verify OTP, issue tokens, set cookies, log activity, track live user
export const verifyOtp = async (req, res) => {
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

    const redisKey = `admin:otp:${admin._id}`;
    const storedOtp = await redis.get(redisKey);

    if (!storedOtp || storedOtp !== otp) {
      return res.status(403).json({ message: 'Invalid or expired OTP' });
    }

    await redis.del(redisKey);

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
      { expiresIn: '24h' }
    );

    const refreshToken = jwt.sign(
      { _id: admin._id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    await Promise.all([
      redis.set(`session:${admin._id}`, accessToken, 'EX', 24 * 60 * 60),
      redis.set(
        `admin:refresh:${admin._id}`,
        refreshToken,
        'EX',
        7 * 24 * 60 * 60
      ),
      redis.incr('liveUserCount'),
    ]);

    const cookieOptions = {
      secure: isProd,
      sameSite: isProd ? 'None' : 'Lax',
      path: '/',
      domain: isProd ? '.finoqz.com' : undefined,
    };

    res.cookie('adminToken', accessToken, {
      ...cookieOptions,
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000,
    });

    res.cookie('adminRefresh', refreshToken, {
      ...cookieOptions,
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    // UI-visible cookie
    res.cookie('adminSessionVisible', 'true', {
      ...cookieOptions,
      httpOnly: false,
      maxAge: 24 * 60 * 60 * 1000,
    });

    res.clearCookie('pendingAdminEmail', {
      ...cookieOptions,
      httpOnly: true,
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
        time: new Date().toLocaleString('en-IN', {
          timeZone: 'Asia/Kolkata',
        }),
      });

      await emailQueue.add('loginAlert', {
        to: admin.email,
        subject: '🔐 Admin Login Alert',
        html,
      });
    } catch (emailErr) {
      console.error('Login alert queue error:', emailErr);
    }

    res.json({
      message: 'OTP verified',
      success: true,
    });
  } catch (err) {
    console.error('Verify OTP error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};



// ✅ Refresh token → issue new access token
export const refreshToken = async (req, res) => {
  try {
    const refreshToken = req.cookies?.adminRefresh;
    if (!refreshToken) {
      return res.status(401).json({ message: 'No refresh token provided' });
    }

    let decoded;
    try {
      decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);
    } catch (err) {
      console.warn('Invalid refresh token:', err.message);
      return res.status(401).json({ message: 'Invalid or expired refresh token' });
    }

    const storedRefresh = await redis.get(`admin:refresh:${decoded._id}`);
    if (!storedRefresh || storedRefresh !== refreshToken) {
      return res.status(403).json({ message: 'Refresh token expired or invalid' });
    }

    // Optional: confirm admin still exists
    const admin = await Admin.findById(decoded._id).select('_id role email');
    if (!admin) {
      return res.status(404).json({ message: 'Admin no longer exists' });
    }

    const ip = req.ip || req.connection?.remoteAddress || '';
    const userAgent = req.get('user-agent') || '';
    const fingerprint = sha256Hex(`${ip}|${userAgent}`);

    const newAccessToken = jwt.sign(
      {
        _id: admin._id,
        role: admin.role,
        email: admin.email,
        fingerprint,
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    await redis.set(
      `session:${admin._id}`,
      newAccessToken,
      'EX',
      24 * 60 * 60
    );

    const cookieOptions = {
      secure: isProd,
      sameSite: isProd ? 'None' : 'Lax',
      path: '/',
      domain: isProd ? '.finoqz.com' : undefined,
    };

    res.cookie('adminToken', newAccessToken, {
      ...cookieOptions,
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000,
    });

    res.json({
      message: 'Token refreshed',
      success: true,
    });
  } catch (err) {
    console.error('Refresh token error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};


// 📧 Get pending email from cookie
export const getPendingEmail = (req, res) => {
  const email = req.cookies?.pendingAdminEmail;

  if (!email) {
    return res.status(404).json({ message: 'No pending email found' });
  }

  // Send real email, mask frontend par karo
  return res.json({ email });
};

// 🔁 Resend OTP
export const resendOtp = async (req, res) => {
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
export const logout = async (req, res) => {
  try {
    const token = req.cookies?.adminToken;

    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET, {
          ignoreExpiration: true,
        });

        if (decoded?._id) {
          // remove tokens
          await Promise.allSettled([
            redis.del(`admin:refresh:${decoded._id}`),
            redis.del(`session:${decoded._id}`),
          ]);

          // safe decrement
          const count = await redis.decr('liveUserCount');
          if (count < 0) {
            await redis.set('liveUserCount', 0);
          }
        }
      } catch (err) {
        console.warn(
          '⚠️ Token decode failed during logout:',
          err.message
        );
      }
    }

    const isProd = process.env.NODE_ENV === 'production';

    const cookieOptions = {
      secure: isProd,
      sameSite: isProd ? 'None' : 'Lax',
      path: '/',
      domain: isProd ? '.finoqz.com' : undefined,
    };

    // clear cookies safely
    res.clearCookie('adminToken', {
      ...cookieOptions,
      httpOnly: true,
    });

    res.clearCookie('adminRefresh', {
      ...cookieOptions,
      httpOnly: true,
    });

    res.clearCookie('pendingAdminEmail', {
      ...cookieOptions,
      httpOnly: true,
    });

    res.clearCookie('adminSessionVisible', {
      ...cookieOptions,
      httpOnly: false,
    });

    return res.status(200).json({
      message: 'Logged out successfully',
      success: true,
    });
  } catch (err) {
    console.error('❌ Logout error:', err);
    return res.status(500).json({
      message: 'Logout failed',
      success: false,
    });
  }
};
