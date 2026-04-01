
import User from '../models/User.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import redis from '../utils/redis.js';
import emailQueue from '../utils/emailQueue.js';
import logActivity from '../utils/logActivity.js';
import generateOTP from '../utils/generateOTP.js';
import signinOtpTemplate from '../emailTemplates/signinotpTemplate.js';
import userOtpTemplate from '../emailTemplates/userOtpTemplate.js';
import getDeviceInfo from '../utils/getDeviceInfo.js';
import { emitLiveUserStats } from '../utils/emmiters.js';
import crypto from 'crypto';

// ✅ STEP 1 — LOGIN (Password Check + Redis OTP + Queue Email)
export const login = async (req, res) => {
  let { email, password } = req.body;

  try {
    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password required",
      });
    }

    email = email.trim().toLowerCase();

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    if (user.status === "blocked" || user.status === "Inactive") {
      return res.status(403).json({
        message: "Your account is blocked. Please contact support.",
      });
    }

    // Backward compatibility for older unblock flow that saved status as "Active"
    if (user.status === "Active") {
      user.status = "approved";
      await user.save();
    }

    const match = await bcrypt.compare(password, user.passwordHash);

    if (!match) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    // Admin-created users must complete verification before normal login OTP.
    if (user.createdByAdmin && !user.emailVerified && user.status === "pending_email_verification") {
      const emailOtp = generateOTP();

      await redis.set(
        `user:emailOtp:${email}`,
        JSON.stringify({ otp: emailOtp, fullName: user.fullName }),
        "EX",
        600
      );

      await emailQueue.add("userEmailOtp", {
        to: email,
        subject: "FinoQz Email Verification OTP",
        html: userOtpTemplate(emailOtp),
      });

      return res.status(403).json({
        message: "Please verify your email first. OTP sent to your email.",
        nextStep: "verify_email_otp",
        status: user.status,
      });
    }

    if (user.createdByAdmin && user.emailVerified && !user.mobileVerified && user.status === "pending_mobile_verification") {
      const mobileOtp = generateOTP();

      await redis.set(
        `user:mobileOtp:${email}`,
        JSON.stringify({ otp: mobileOtp, mobile: user.mobile }),
        "EX",
        600
      );

      // Temporary testing flow: do not send mobile OTP over email, show via popup cookie.
      return res
        .cookie('tempOtp', mobileOtp, {
          httpOnly: false,
          maxAge: 2 * 60 * 1000,
          path: '/',
          sameSite: 'lax',
          secure: process.env.NODE_ENV === 'production',
          domain: process.env.NODE_ENV === 'production' ? '.finoqz.com' : undefined,
        })
        .status(403)
        .json({
          message: "Please verify your mobile first. OTP is available in popup.",
          nextStep: "verify_mobile_otp",
          status: user.status,
          ...(process.env.NODE_ENV !== 'production' && { otp: mobileOtp }),
        });
    }

    if (!user.emailVerified || !user.mobileVerified) {
      return res.status(403).json({
        message: "Please complete email and mobile verification before login.",
        nextStep: "resume_signup_verification",
        status: user.status,
      });
    }

    if (user.status !== "approved") {
      return res.status(403).json({
        message: "Account not approved yet",
      });
    }

    // Generate OTP
    const otp = generateOTP();

    await redis.set(
      `user:loginOtp:${email}`,
      JSON.stringify({ otp }),
      "EX",
      600 // 10 minutes
    );

    // Queue email
    try {
      await emailQueue.add("userLoginOtp", {
        to: email,
        subject: "FinoQz Login OTP",
        html: signinOtpTemplate({ otp }),
      });
    } catch (queueErr) {
      console.error("Queue error (login OTP):", queueErr);
    }

    // Log activity
    await logActivity({
      req,
      actorType: "user",
      actorId: user._id,
      action: "login_otp_sent",
      meta: {
        email,
        device: getDeviceInfo(req),
      },
    });

    return res.json({
      message: "OTP sent to email",
      nextStep: "verify_login_otp",
    });

  } catch (err) {
    console.error("User login error:", err);
    return res.status(500).json({
      message: "Server error during login",
    });
  }
};

// ✅ STEP 2 — VERIFY OTP → ISSUE TOKEN + COOKIE
export const verifyLoginOtp = async (req, res) => {
  const { email, otp } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user)
      return res.status(404).json({ message: "User not found" });

    if (user.status === "blocked" || user.status === "Inactive") {
      return res.status(403).json({ message: "Your account is blocked. Please contact support." });
    }

    if (user.status === "Active") {
      user.status = "approved";
      await user.save();
    }

    if (!user.emailVerified || !user.mobileVerified) {
      return res.status(403).json({
        message: "Please complete email and mobile verification before login.",
        nextStep: "resume_signup_verification",
        status: user.status,
      });
    }

    if (user.status !== "approved") {
      return res.status(403).json({ message: "Account not approved yet" });
    }

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
export const logout = async (req, res) => {
  try {
    const userId = req.userId?.toString();

    if (userId) {
      await Promise.all([
        redis.del(`session:${userId}`),
        redis.srem("liveUsers", userId),
        redis.del(`liveUser:${userId}`),
      ]);
    }

    const isProd = process.env.NODE_ENV === "production";

    // ✅ Clear auth cookie
    res.clearCookie("userToken", {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? "None" : "Lax",
      path: "/",
    });

    // optional: update live user stats
    const io = req.app.get("io");
    if (io) await emitLiveUserStats(io);

    return res.json({
      message: "Logged out successfully",
      success: true,
    });

  } catch (err) {
    console.error("Logout error:", err);
    return res
      .status(500)
      .json({ message: "Server error during logout" });
  }
};


// ✅ STEP 4 — REFRESH TOKEN
export const refreshToken = async (req, res) => {
  try {
    const authHeader = req.headers["authorization"];
    const oldToken =
      req.cookies?.userToken ||
      (authHeader && authHeader.startsWith("Bearer ")
        ? authHeader.split(" ")[1]
        : null);

    if (!oldToken) {
      return res.status(401).json({ message: "No token provided" });
    }

    let decoded;
    try {
      decoded = jwt.verify(oldToken, process.env.JWT_SECRET, {
        ignoreExpiration: true,
      });
    } catch {
      return res.status(401).json({ message: "Invalid token" });
    }

    const userId = decoded?.id;
    if (!userId) {
      return res.status(401).json({ message: "Invalid session" });
    }

    // ✅ Check Redis session
    const storedToken = await redis.get(`session:${userId}`);
    if (!storedToken || storedToken !== oldToken) {
      return res.status(403).json({
        message: "Session expired or invalid",
      });
    }

    // ✅ Create new token
    const now = Math.floor(Date.now() / 1000);
    const expiresInSeconds = 86400;

    const newToken = jwt.sign(
      {
        id: userId,
        role: decoded.role || "user",
        fingerprint: decoded.fingerprint,
        iat: now,
      },
      process.env.JWT_SECRET,
      { expiresIn: expiresInSeconds }
    );

    // ✅ Rotate session in Redis
    await redis.set(
      `session:${userId}`,
      newToken,
      "EX",
      expiresInSeconds
    );

    const isProd = process.env.NODE_ENV === "production";

    // ✅ Set cookie
    res.cookie("userToken", newToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? "None" : "Lax",
      path: "/",
      maxAge: expiresInSeconds * 1000,
    });

    return res.json({ message: "Token refreshed" });

  } catch (err) {
    console.error("❌ Refresh token error:", err);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};


// ✅ STEP 5 — RESEND OTP
export const resendOtp = async (req, res) => {
  const email = req.body.email?.toLowerCase().trim();

  if (!email) {
    return res
      .status(400)
      .json({ message: "Email is required to resend OTP" });
  }

  try {
    const user = await User.findOne({ email });
    if (!user)
      return res.status(404).json({ message: "User not found" });

    if (user.status !== "approved")
      return res
        .status(403)
        .json({ message: "Account not approved yet" });

    // ✅ cooldown check (avoid spam)
    const cooldownKey = `user:otpCooldown:${email}`;
    const cooldown = await redis.get(cooldownKey);

    if (cooldown) {
      return res.status(429).json({
        message: "Please wait before requesting OTP again",
      });
    }

    const otp = generateOTP();

    await redis.set(
      `user:loginOtp:${email}`,
      JSON.stringify({ otp }),
      "EX",
      10 * 60
    );

    // 60 sec resend cooldown
    await redis.set(cooldownKey, 1, "EX", 60);

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
        device: getDeviceInfo(req),
      },
    });

    return res.json({
      message: "OTP resent to email",
    });

  } catch (err) {
    console.error("Resend OTP error:", err);
    return res
      .status(500)
      .json({ message: "Server error during OTP resend" });
  }
};

