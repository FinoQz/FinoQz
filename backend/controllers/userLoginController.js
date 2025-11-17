const User = require('../models/User');
const Otp = require('../models/Otp');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const sendEmail = require('../utils/sendEmail');
const generateOTP = require('../utils/generateOTP');
const signinOtpTemplate = require('../emailTemplates/signinotpTemplate'); // 👈 single import

exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: "Invalid email or password" });

    if (user.status !== "approved") return res.status(403).json({ message: "Account not approved yet" });

    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) return res.status(401).json({ message: "Invalid email or password" });

    // ✅ Generate OTP
    const otp = generateOTP();

    await Otp.create({
      email,
      code: otp,
      expiresAt: Date.now() + 10 * 60 * 1000,
    });

    // ✅ Send OTP email
    sendEmail(
      email,
      "FinoQz Login OTP",
      signinOtpTemplate({ otp }) // 👈 must return HTML string
    ).catch(err => console.error("Login OTP email failed:", err));

    return res.json({ message: "OTP initiated", nextStep: "verify_login_otp" });
  } catch (err) {
    console.error("User login error:", err);
    return res.status(500).json({ message: "Server error during login" });
  }
};

exports.verifyLoginOtp = async (req, res) => {
  const { email, otp } = req.body;

  try {
    const user = await User.findOne({ email });
    const otpRecord = await Otp.findOne({ email });

    if (!user || !otpRecord) return res.status(404).json({ message: "No OTP found for this user" });
    if (otpRecord.code !== otp) return res.status(403).json({ message: "Incorrect OTP" });
    if (Date.now() > otpRecord.expiresAt) return res.status(410).json({ message: "OTP expired" });

    // ✅ OTP verified → issue JWT
    const token = jwt.sign({ id: user._id, role: "user" }, process.env.JWT_SECRET, { expiresIn: "30m" });

    await Otp.deleteOne({ _id: otpRecord._id });

    return res.json({
      message: "Login successful",
      token,
      user: { id: user._id, fullName: user.fullName, email: user.email },
      redirect: "/user_dash"
    });
  } catch (err) {
    console.error("Verify login OTP error:", err);
    return res.status(500).json({ message: "Server error during OTP verification" });
  }
};
