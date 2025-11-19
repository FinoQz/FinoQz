const User = require('../models/User');
const Otp = require('../models/Otp');
const bcrypt = require('bcrypt');
const sendEmail = require('../utils/sendEmail');
const axios = require('axios');
const generateOTP = require('../utils/generateOTP');
const getDeviceInfo = require('../utils/getDeviceInfo');
const otpTemplate = require('../emailTemplates/userOtpTemplate');
const awaitingApprovalTemplate = require('../emailTemplates/userAwaitingApprovalTemplate');
const approvalRequestTemplate = require('../emailTemplates/adminApprovalRequestTemplate');
const approvalSuccessTemplate = require('../emailTemplates/userApprovalSuccessTemplate');
const rejectionTemplate = require('../emailTemplates/userRejectionTemplate');

// Step 1: Initiate signup with email OTP
exports.initiateSignup = async (req, res) => {
  const { fullName, email } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    // 👇 Instead of dead-end, tell frontend to resume
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

  await Otp.create({
    email,
    code: otp,
    fullName,
    expiresAt: Date.now() + 10 * 60 * 1000,
  });

  Promise.resolve().then(() => {
    sendEmail(email, "FinoQz Email OTP", userOtpTemplate(otp)).catch((err) =>
      console.error("Email OTP failed:", err)
    );
  });

  res.json({ message: "OTP sent to email", nextStep: "verify_email_otp" });
};

// Step 2: Verify email OTP and create user
exports.verifyEmailOtp = async (req, res) => {
  const { email, otp } = req.body;

  try {
    const otpRecord = await Otp.findOne({ email });

    if (!otpRecord) {
      return res.status(404).json({ message: "No OTP found for this email." });
    }

    if (otpRecord.code !== otp) {
      return res.status(403).json({ message: "Incorrect OTP" });
    }

    if (Date.now() > otpRecord.expiresAt) {
      return res.status(410).json({ message: "OTP has expired" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      // 👇 Instead of dead-end, tell frontend to resume
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

    const user = new User({
      fullName: otpRecord.fullName,
      email,
      emailVerified: true,
      status: "email_verified",
    });

    await user.save();
    await Otp.deleteOne({ _id: otpRecord._id });

    return res.status(200).json({
      message: "Email verified.",
      nextStep: "mobile_password", // 👈 tell FE what to do next
    });
  } catch (err) {
    console.error("OTP verification error:", err);
    return res.status(500).json({ message: "Server error during OTP verification." });
  }
};


//Step 3: Resend email OTP

exports.resendEmailOtp = async (req, res) => {
  const { email } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      // 👇 Instead of dead-end, tell frontend to resume
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

    const otpRecord = await Otp.findOne({ email });
    if (!otpRecord) {
      return res.status(404).json({
        message: "No OTP found for this email. Please initiate signup first.",
      });
    }

    const newOtp = generateOTP();
    otpRecord.code = newOtp;
    otpRecord.expiresAt = Date.now() + 10 * 60 * 1000;
    await otpRecord.save();

    Promise.resolve().then(() => {
      sendEmail(email, "FinoQz Email OTP", otpTemplate(newOtp)).catch((err) =>
        console.error("Resend OTP email failed:", err)
      );
    });

    // 👇 Return OTP in response for testing/demo (remove in production)
    return res.json({
      message: "New OTP sent to email.",
      otp: newOtp,
      nextStep: "verify_email_otp",
    });
  } catch (err) {
    console.error("Resend OTP error:", err);
    return res
      .status(500)
      .json({ message: "Server error during resend OTP." });
  }
};

// Step 4: Submit mobile + password


exports.submitMobilePassword = async (req, res) => {
  try {
    const { email, mobile, password } = req.body;

    const user = await User.findOne({ email });
    if (!user || user.status !== "email_verified") {
      return res.status(400).json({ message: "User not verified or invalid status." });
    }

    const otp = generateOTP();
    const hash = await bcrypt.hash(password, 10);

    // 👉 Save OTP in DB for verification later
    await Otp.create({
      email,
      code: otp,
      fullName: user.fullName,
      expiresAt: Date.now() + 10 * 60 * 1000,
    });

    // 👉 phone.email SMS logic (kept intact for future use)
    try {
      await axios.post('https://api.phone.email/v1/send', {
        to: mobile,
        message: `Your FinoQz OTP is ${otp}`,
        sender_id: 'FINOQZ',
        template_id: 'your_template_id', // replace with actual DLT template ID later
      }, {
        headers: {
          Authorization: `Bearer your_api_key`, // replace with actual API key later
          'Content-Type': 'application/json',
        },
      });
    } catch (err) {
      console.warn("SMS not sent (DLT missing). Showing OTP on screen for now.");
    }

    // 👉 Update user record
    user.mobile = mobile;
    user.passwordHash = hash;
    user.status = "pending_mobile_verification";
    await user.save();

    // 👉 Response: show OTP on screen for now
    res.json({
      message: "OTP generated",
      otp, // ⚠️ only for testing/demo, remove later
    });
  } catch (err) {
    console.error("Submit mobile/password error:", err);
    res.status(500).json({ message: "Server error during signup." });
  }
};



// Step 5: Verify mobile OTP
exports.verifyMobileOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({ email });
    const otpRecord = await Otp.findOne({ email });

    if (!user || user.status !== "pending_mobile_verification") {
      return res.status(400).json({ message: "Invalid user or status" });
    }

    if (!otpRecord) {
      return res.status(404).json({ message: "No OTP found for this mobile." });
    }

    if (otpRecord.code !== otp) {
      return res.status(403).json({ message: "Incorrect OTP" });
    }

    if (Date.now() > otpRecord.expiresAt) {
      return res.status(410).json({ message: "OTP has expired" });
    }

    user.mobileVerified = true;
    user.status = "awaiting_admin_approval";

    await user.save();
    await Otp.deleteOne({ _id: otpRecord._id });

    // ✅ Send mail to user (awaiting approval)
    Promise.resolve().then(() => {
      sendEmail(
        user.email,
        "FinoQz Signup Complete — Awaiting Approval",
        awaitingApprovalTemplate({
          fullName: user.fullName,
          email: user.email,
        })
        
      ).catch(err => console.error("Awaiting approval email failed:", err));
    });

    // ✅ Send mail to admin (approval request)
    Promise.resolve().then(() => {
      sendEmail(
        "info.finoqz@gmail.com",
        "New User Awaiting Approval",
        approvalRequestTemplate({
          fullName: user.fullName,
          email: user.email,
          mobile: user.mobile,
        })
      ).catch(err => console.error("Admin approval request email failed:", err));
    });

    res.json({ message: "Mobile OTP verified — awaiting admin approval" });
  } catch (err) {
    console.error("OTP verification error:", err);
    res.status(500).json({ message: "Server error during OTP verification" });
  }
};

// Step 6: Resend mobile OTP
exports.resendMobileOtp = async (req, res) => {
  try {
    const { email, mobile } = req.body;

    const user = await User.findOne({ email });
    if (!user || user.status !== "pending_mobile_verification") {
      return res.status(400).json({ message: "Invalid user or status" });
    }

    const otpRecord = await Otp.findOne({ email });
    if (!otpRecord) {
      return res.status(404).json({ message: "No OTP found. Please initiate mobile verification first." });
    }

    // 👉 Generate new OTP
    const newOtp = generateOTP();

    // 👉 Update OTP record
    otpRecord.code = newOtp;
    otpRecord.expiresAt = Date.now() + 10 * 60 * 1000;
    await otpRecord.save();

    // 👉 Send SMS (DLT logic placeholder)
    try {
      await axios.post("https://api.phone.email/v1/send", {
        to: mobile,
        message: `Your FinoQz OTP is ${newOtp}`,
        sender_id: "FINOQZ",
        template_id: "your_template_id",
      }, {
        headers: {
          Authorization: `Bearer your_api_key`,
          "Content-Type": "application/json",
        },
      });
    } catch (err) {
      console.warn("Resend SMS not sent (DLT missing). Showing OTP on screen for now.");
    }

    // 👉 Response with OTP (⚠️ testing only)
    res.json({
      message: "New OTP resent to mobile",
      otp: newOtp, // 👈 return OTP so frontend can show popup
    });
  } catch (err) {
    console.error("Resend mobile OTP error:", err);
    res.status(500).json({ message: "Server error during resend mobile OTP." });
  }
};


// Step 5: Get signup status
exports.getSignupStatus = async (req, res) => {
  try {
    const { email } = req.query; // /user/signup/status?email=...
    if (!email) return res.status(400).json({ message: "Email is required" });

    const user = await User.findOne({ email });

    if (!user) {
      // Not created yet — user must start at Step 1
      return res.json({
        exists: false,
        nextStep: "email_otp",
        status: "not_started",
        emailVerified: false,
        mobileVerified: false,
        passwordSet: false,
      });
    }

    const passwordSet = Boolean(user.passwordHash);
    const emailVerified = Boolean(user.emailVerified);
    const mobileVerified = Boolean(user.mobileVerified);

    // Decide next step based on status
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
        nextStep = passwordSet ? "login" : "set_password"; // safeguard
        break;
      case "rejected":
        nextStep = "support"; // optional: direct to contact/help
        break;
      default:
        nextStep = emailVerified ? "mobile_password" : "email_otp";
    }

    return res.json({
      exists: true,
      status: user.status,
      emailVerified,
      mobileVerified,
      passwordSet,
      nextStep,
    });
  } catch (err) {
    console.error("Get signup status error:", err);
    return res.status(500).json({ message: "Server error getting signup status" });
  }
};



// Step 6: Admin approves user
exports.approveUser = async (req, res) => {
  const { userId } = req.params;
  const user = await User.findById(userId);

  if (!user || user.status !== 'awaiting_admin_approval') {
    return res.status(400).json({ message: 'Invalid user or status' });
  }

  user.status = 'approved';
  await user.save();

  Promise.resolve().then(() => {
    sendEmail(user.email, 'FinoQz Account Approved', approvalSuccessTemplate({
      fullName: user.fullName,
      email: user.email,
      password: "Password you set during signup"
    })).catch(err => console.error('Approval email failed:', err));
  });

  res.json({ message: 'User approved' });
};

// Step 7: Admin rejects user
exports.rejectUser = async (req, res) => {
  const { userId } = req.params;
  const user = await User.findById(userId);

  if (!user || user.status !== 'awaiting_admin_approval') {
    return res.status(400).json({ message: 'Invalid user or status' });
  }

  user.status = 'rejected';
  await user.save();

  Promise.resolve().then(() => {
    sendEmail(user.email, 'FinoQz Signup Update', rejectionTemplate(user.fullName))
      .catch(err => console.error('Rejection email failed:', err));
  });

  res.json({ message: 'User rejected' });
};
