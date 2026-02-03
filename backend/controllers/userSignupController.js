// controllers/userSignupController.js

const User = require('../models/User');
const bcrypt = require('bcrypt');
const axios = require('axios');

const generateOTP = require('../utils/generateOTP');
const getDeviceInfo = require('../utils/getDeviceInfo');

const redis = require('../utils/redis');
const emailQueue = require('../utils/emailQueue');
const logActivity = require('../utils/logActivity');

const userOtpTemplate = require('../emailTemplates/userOtpTemplate');
const awaitingApprovalTemplate = require('../emailTemplates/userAwaitingApprovalTemplate');
const approvalRequestTemplate = require('../emailTemplates/adminApprovalRequestTemplate');
const approvalSuccessTemplate = require('../emailTemplates/userApprovalSuccessTemplate');
const rejectionTemplate = require('../emailTemplates/userRejectionTemplate');


// ✅ STEP 1: Initiate Signup (Email OTP)
exports.initiateSignup = async (req, res) => {
  try {
    const { fullName, email } = req.body;

    console.log("➡️ Signup initiated for:", email);

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      console.log("⚠️ Email already registered:", email);

      await logActivity({
        req,
        actorType: "user",
        actorId: existingUser._id,
        action: "signup_attempt_existing_email",
        meta: { email }
      });

      return res.status(409).json({
        message: "Email already registered. Resume signup.",
        status: existingUser.status,
        nextStep:
          existingUser.status === "email_verified"
            ? "mobile_password"
            : existingUser.status === "pending_mobile_verification"
              ? "verify_mobile_otp"
              : existingUser.status === "awaiting_admin_approval"
                ? "awaiting_approval"
                : "login",
      });
    }

    const otp = generateOTP();
    console.log("✅ Email OTP generated:", otp);

    await redis.set(
      `user:emailOtp:${email}`,
      JSON.stringify({ otp, fullName }),
      "EX",
      600
    );

    console.log("✅ Email OTP stored in Redis");

    await emailQueue.add("userEmailOtp", {
      to: email,
      subject: "FinoQz Email OTP",
      html: userOtpTemplate(otp),
    });

    console.log("📨 Email OTP queued");

    await logActivity({
      req,
      actorType: "user",
      actorId: null,
      action: "signup_email_otp_sent",
      meta: { email }
    });

    return res.json({ message: "OTP sent to email", nextStep: "verify_email_otp" });
  } catch (err) {
    console.error("❌ initiateSignup error:", err);
    return res.status(500).json({ message: "Server error during signup initiation." });
  }
};


exports.verifyEmailOtp = async (req, res) => {
  try {
    const email =
      req.cookies?.userEmail || req.body.email || req.query.email || req.headers["x-signup-email"];
    const { otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ message: "Missing email or OTP" });
    }

    console.log("➡️ Verifying email OTP for:", email);

    const redisKey = `user:emailOtp:${email}`;
    const stored = await redis.get(redisKey);

    if (!stored) {
      console.log("❌ No OTP found or expired");
      return res.status(404).json({ message: "No OTP found or expired." });
    }

    const { otp: storedOtp, fullName } = JSON.parse(stored);

    if (storedOtp !== otp) {
      console.log("❌ Incorrect OTP");

      await logActivity({
        req,
        actorType: "user",
        actorId: null,
        action: "signup_email_otp_incorrect",
        meta: { email }
      });

      return res.status(403).json({ message: "Incorrect OTP" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log("⚠️ User already exists during OTP verify");
      return res.status(409).json({
        message: "Email already registered. Resume signup.",
        status: existingUser.status,
      });
    }

    const user = new User({
      fullName,
      email,
      emailVerified: true,
      status: "email_verified",
    });

    await user.save();
    await redis.del(redisKey);

    console.log("✅ Email verified & user created:", user._id);

    await logActivity({
      req,
      actorType: "user",
      actorId: user._id,
      action: "signup_email_verified",
      meta: {
        email,
        device: getDeviceInfo(req)
      }
    });

    return res.json({
      message: "Email verified.",
      nextStep: "mobile_password",
    });
  } catch (err) {
    console.error("❌ verifyEmailOtp error:", err);
    return res.status(500).json({ message: "Server error during OTP verification." });
  }
};


exports.resendEmailOtp = async (req, res) => {
  try {
    const email = req.cookies?.userEmail || req.body.email;

    if (!email) {
      return res.status(400).json({ message: "Missing email" });
    }

    console.log("➡️ Resend email OTP for:", email);

    const stored = await redis.get(`user:emailOtp:${email}`);
    if (!stored) {
      console.log("❌ No OTP found to resend");
      return res.status(404).json({
        message: "No OTP found. Please initiate signup first.",
      });
    }

    const parsed = JSON.parse(stored);
    const newOtp = generateOTP();

    await redis.set(
      `user:emailOtp:${email}`,
      JSON.stringify({ ...parsed, otp: newOtp }),
      "EX",
      600
    );

    console.log("✅ New email OTP generated:", newOtp);

    await emailQueue.add("userEmailOtp", {
      to: email,
      subject: "FinoQz Email OTP",
      html: userOtpTemplate(newOtp),
    });

    console.log("📨 Resend OTP queued");

    await logActivity({
      req,
      actorType: "user",
      actorId: null,
      action: "signup_email_otp_resent",
      meta: { email }
    });

    return res.json({
      message: "New OTP sent to email.",
      ...(process.env.NODE_ENV !== 'production' && { otp: newOtp }),
      nextStep: "verify_email_otp",
    });
  } catch (err) {
    console.error("❌ resendEmailOtp error:", err);
    return res.status(500).json({ message: "Server error during resend OTP." });
  }
};



exports.submitMobilePassword = async (req, res) => {
  try {
    const email = req.cookies?.userEmail || req.body.email || req.headers["x-signup-email"];
    const { mobile, password } = req.body;

    if (!email || !mobile || !password) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    console.log("➡️ Submitting mobile + password for:", email);

    const user = await User.findOne({ email });
    if (!user || user.status !== "email_verified") {
      console.log("❌ Invalid user or status");
      return res.status(400).json({ message: "User not verified or invalid status." });
    }

    const mobileExists = await User.findOne({ mobile });
    if (mobileExists) {
      console.log("❌ Mobile already registered:", mobile);
      return res.status(409).json({
        message: "Mobile number already registered.",
        nextStep: "login"
      });
    }

    const otp = generateOTP();
    const hash = await bcrypt.hash(password, 10);

    await redis.set(
      `user:mobileOtp:${email}`,
      JSON.stringify({ otp, mobile }),
      "EX",
      600
    );

    console.log("✅ Mobile OTP generated:", otp);

    user.mobile = mobile;
    user.passwordHash = hash;
    user.status = "pending_mobile_verification";
    await user.save();

    console.log("✅ User updated for mobile verification");

    await logActivity({
      req,
      actorType: "user",
      actorId: user._id,
      action: "signup_mobile_password_submitted",
      meta: { email, mobile }
    });

    // ✅ Set tempOtp cookie for frontend popup (only in dev)
    return res
      .cookie('tempOtp', otp, {
        httpOnly: false,
        maxAge: 10 * 1000,
        path: '/',
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        domain: '.finoqz.com' // ✅ shared domain for frontend + backend
      })
      .json({
        message: "OTP generated",
        otp // ✅ include for testing (remove in prod)
      });



  } catch (err) {
    console.error("❌ submitMobilePassword error:", err);
    return res.status(500).json({ message: "Server error during signup." });
  }
};


exports.verifyMobileOtp = async (req, res) => {
  try {
    const email = req.cookies?.userEmail || req.body.email || req.headers["x-signup-email"];
    const { otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ message: "Missing email or OTP" });
    }

    console.log("➡️ Verifying mobile OTP for:", email);

    const user = await User.findOne({ email });
    if (!user || user.status !== "pending_mobile_verification") {
      console.log("❌ Invalid user or status");
      return res.status(400).json({ message: "Invalid user or status" });
    }

    const redisKey = `user:mobileOtp:${email}`;
    const stored = await redis.get(redisKey);

    if (!stored) {
      console.log("❌ No mobile OTP found");
      return res.status(404).json({ message: "No OTP found or expired." });
    }

    const { otp: storedOtp, mobile } = JSON.parse(stored);

    if (storedOtp !== otp) {
      console.log("❌ Incorrect mobile OTP");

      await logActivity({
        req,
        actorType: "user",
        actorId: user._id,
        action: "signup_mobile_otp_incorrect",
        meta: { email }
      });

      return res.status(403).json({ message: "Incorrect OTP" });
    }

    const mobileExists = await User.findOne({ mobile, _id: { $ne: user._id } });
    if (mobileExists) {
      console.log("❌ Duplicate mobile detected during OTP verify");
      return res.status(409).json({
        message: "Mobile number already registered.",
        nextStep: "login"
      });
    }

    user.mobileVerified = true;
    user.status = "awaiting_admin_approval";
    await user.save();
    await redis.del(redisKey);

    console.log("✅ Mobile OTP verified for:", user._id);

    await logActivity({
      req,
      actorType: "user",
      actorId: user._id,
      action: "signup_mobile_verified",
      meta: {
        email,
        mobile,
        device: getDeviceInfo(req)
      }
    });

    const io = req.app.get("io");
    if (io) {
      const [totalUsers, activeUsers, pendingApprovals] = await Promise.all([
        User.countDocuments({}),
        User.countDocuments({ status: "approved" }),
        User.countDocuments({ status: "awaiting_admin_approval" }),
      ]);

      io.emit("dashboard:stats", {
        totalUsers,
        activeUsers,
        pendingApprovals,
      });

      console.log("📡 Emitted dashboard:stats from verifyMobileOtp");
    }

    try {
      await emailQueue.add("userAwaitingApproval", {
        to: user.email,
        subject: "FinoQz Signup Complete — Awaiting Approval",
        html: awaitingApprovalTemplate({
          fullName: user.fullName,
          email: user.email,
        }),
      });

      await emailQueue.add("adminApprovalRequest", {
        to: "info.finoqz@gmail.com",
        subject: "New User Awaiting Approval",
        html: approvalRequestTemplate({
          fullName: user.fullName,
          email: user.email,
          mobile: mobile || user.mobile,
        }),
      });

      console.log("📨 Approval emails queued");
    } catch (queueErr) {
      console.error("❌ Queue error:", queueErr);
    }

    return res.json({ message: "Mobile OTP verified — awaiting admin approval" });
  } catch (err) {
    console.error("❌ verifyMobileOtp error:", err);
    return res.status(500).json({ message: "Server error during OTP verification" });
  }
};



exports.resendMobileOtp = async (req, res) => {
  try {
    const email = req.cookies?.userEmail || req.body.email;

    if (!email) {
      return res.status(400).json({ message: "Missing email" });
    }

    console.log("➡️ Resend mobile OTP for:", email);

    const stored = await redis.get(`user:mobileOtp:${email}`);
    if (!stored) {
      console.log("❌ No mobile OTP found to resend");
      return res.status(404).json({
        message: "No OTP found. Please submit mobile & password first.",
      });
    }

    const parsed = JSON.parse(stored);
    const newOtp = generateOTP();

    await redis.set(
      `user:mobileOtp:${email}`,
      JSON.stringify({ ...parsed, otp: newOtp }),
      "EX",
      600
    );

    console.log("✅ New mobile OTP generated:", newOtp);

    await logActivity({
      req,
      actorType: "user",
      actorId: null,
      action: "signup_mobile_otp_resent",
      meta: { email }
    });

    // ✅ Set tempOtp cookie for frontend popup (shared domain)
    return res
      .cookie('tempOtp', newOtp, {
        httpOnly: false,
        maxAge: 10 * 1000,
        path: '/',
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        domain: '.finoqz.com' // ✅ shared domain for frontend + backend
      })
      .json({
        message: "New OTP sent to mobile.",
        otp: newOtp, // ✅ include for testing (remove in prod)
        nextStep: "verify_mobile_otp",
      });

  } catch (err) {
    console.error("❌ resendMobileOtp error:", err);
    return res.status(500).json({ message: "Server error during resend mobile OTP." });
  }
};




// ✅ STEP 7: Get Signup Status
exports.getSignupStatus = async (req, res) => {
  try {
    const email =
      req.cookies?.userEmail || req.query.email || req.body.email || req.headers["x-signup-email"];

    if (!email) return res.status(400).json({ message: "Email is required" });

    console.log("➡️ Checking signup status for:", email);

    await logActivity({
      req,
      actorType: "user",
      actorId: null,
      action: "signup_status_checked",
      meta: { email }
    });

    const user = await User.findOne({ email });

    if (!user) {
      console.log("ℹ️ No user found, signup not started");
      return res.json({
        exists: false,
        nextStep: "email_otp",
        status: "not_started",
      });
    }

    const passwordSet = Boolean(user.passwordHash);
    const emailVerified = Boolean(user.emailVerified);
    const mobileVerified = Boolean(user.mobileVerified);

    let nextStep = "email_otp";

    switch (user.status) {
      case "email_verified":
        nextStep = "mobile_password";
        break;
      case "pending_mobile_verification":
        nextStep = "verify_mobile_otp";
        break;
      case "awaiting_admin_approval":
        nextStep = "awaiting_approval";
        break;
      case "approved":
        nextStep = passwordSet ? "login" : "set_password";
        break;
      case "rejected":
        nextStep = "support";
        break;
    }

    console.log("✅ Signup status:", user.status);

    return res.json({
      exists: true,
      status: user.status,
      emailVerified,
      mobileVerified,
      passwordSet,
      nextStep,
    });
  } catch (err) {
    console.error("❌ getSignupStatus error:", err);
    return res.status(500).json({ message: "Server error getting signup status" });
  }
};



//✅ STEP 8: Admin Approves User
exports.approveUser = async (req, res) => {
  try {
    const { userId } = req.params;
    console.log("➡️ Admin approving user:", userId);

    const user = await User.findById(userId);

    if (!user || user.status !== "awaiting_admin_approval") {
      console.log("❌ Invalid user or status");
      return res.status(400).json({ message: "Invalid user or status" });
    }

    if (!user.email) {
      console.error("❌ User email missing, cannot send approval email");
      return res.status(500).json({ message: "User email missing" });
    }

    user.status = "approved";
    await user.save();

    console.log("✅ User approved:", userId);

    await logActivity({
      req,
      actorType: "admin",
      actorId: req.adminId,
      action: "user_approved",
      meta: { userId }
    });

    await emailQueue.add("userApproved", {
      to: user.email,
      subject: "FinoQz Account Approved",
      html: approvalSuccessTemplate({
        fullName: user.fullName || "User",
        email: user.email,
        password: "Password you set during signup",
      }),
    });

    console.log("📨 Approval email queued");

    return res.json({ message: "User approved" });
  } catch (err) {
    console.error("❌ approveUser error:", err);
    return res.status(500).json({ message: "Server error approving user" });
  }
};




// ✅ STEP 9: Admin Rejects User
exports.rejectUser = async (req, res) => {
  try {
    const { userId } = req.params;

    console.log("➡️ Admin rejecting user:", userId);

    const user = await User.findById(userId);

    if (!user || user.status !== "awaiting_admin_approval") {
      console.log("❌ Invalid user or status");
      return res.status(400).json({ message: "Invalid user or status" });
    }

    user.status = "rejected";
    await user.save();

    console.log("✅ User rejected:", userId);

    await logActivity({
      req,
      actorType: "admin",
      actorId: req.adminId,
      action: "user_rejected",
      meta: { userId }
    });

    await emailQueue.add("userRejected", {
      to: user.email,
      subject: "FinoQz Signup Update",
      html: rejectionTemplate(user.fullName),
    });

    console.log("📨 Rejection email queued");

    return res.json({ message: "User rejected" });
  } catch (err) {
    console.error("❌ rejectUser error:", err);
    return res.status(500).json({ message: "Server error rejecting user" });
  }
};
