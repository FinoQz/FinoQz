const User = require('../models/User');
const Otp = require('../models/Otp');
const bcrypt = require('bcrypt');
const sendEmail = require('../utils/sendEmail');
const generateOTP = require('../utils/generateOTP');
const forgotPasswordTemplate = require('../emailTemplates/forgotPasswordTemplate');

// Step 1: Initiate forgot password
exports.initiateForgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "No account found with this email" });

    const otp = generateOTP();

    await Otp.create({
      email,
      code: otp,
      expiresAt: Date.now() + 10 * 60 * 1000,
    });

    sendEmail(
      email,
      "FinoQz Password Reset OTP",
      forgotPasswordTemplate({ otp })
    ).catch(err => console.error("Forgot password email failed:", err));

    return res.json({ message: "OTP sent", nextStep: "verify_reset_otp" });
  } catch (err) {
    console.error("Forgot password error:", err);
    return res.status(500).json({ message: "Server error during forgot password" });
  }
};

// Step 2: Verify OTP
exports.verifyForgotPasswordOtp = async (req, res) => {
  const { email, otp } = req.body;

  try {
    const otpRecord = await Otp.findOne({ email });
    if (!otpRecord) return res.status(404).json({ message: "No OTP found for this user" });
    if (otpRecord.code !== otp) return res.status(403).json({ message: "Incorrect OTP" });
    if (Date.now() > otpRecord.expiresAt) return res.status(410).json({ message: "OTP expired" });

    await Otp.deleteOne({ _id: otpRecord._id });

    return res.json({ message: "OTP verified", nextStep: "reset_password" });
  } catch (err) {
    console.error("Verify forgot password OTP error:", err);
    return res.status(500).json({ message: "Server error during OTP verification" });
  }
};

// Step 3: Reset password
exports.resetPassword = async (req, res) => {
  const { email, newPassword } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.passwordHash = hashedPassword;
    await user.save();

    return res.json({ message: "Password reset successful" });
  } catch (err) {
    console.error("Reset password error:", err);
    return res.status(500).json({ message: "Server error during password reset" });
  }
};
