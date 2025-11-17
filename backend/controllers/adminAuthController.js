const Admin = require('../models/Admin');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const sendEmail = require('../utils/sendEmail');
const generateOTP = require('../utils/generateOTP');
const getDeviceInfo = require('../utils/getDeviceInfo');
const otpTemplate = require('../emailTemplates/otpTemplate');
const loginAlertTemplate = require('../emailTemplates/loginAlertTemplate');

// Step 1: Admin login with password → triggers OTP
exports.login = async (req, res) => {
  const { identifier, password } = req.body;

  const admin = await Admin.findOne({
    $or: [{ email: identifier }, { username: identifier }],
  });

  if (!admin || !(await bcrypt.compare(password, admin.password))) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const otp = generateOTP();
  admin.otp = otp;
  admin.otpExpires = Date.now() + 5 * 60 * 1000;
  await admin.save();

  Promise.resolve().then(() => {
    sendEmail(admin.email, 'FinoQz Admin OTP', otpTemplate(otp)).catch((err) =>
      console.error('OTP email failed:', err)
    );
  });

  res.json({ message: 'OTP initiated' });
};

// Step 2: Verify OTP → issue JWT + alert
exports.verifyOtp = async (req, res) => {
  const { email, otp } = req.body;

  const admin = await Admin.findOne({
    $or: [{ email }, { username: email }],
  });

  if (!admin || admin.otp !== otp || Date.now() > admin.otpExpires) {
    return res.status(403).json({ message: 'Invalid or expired OTP' });
  }

  admin.otp = null;
  admin.otpExpires = null;
  admin.lastLoginAt = new Date();
  await admin.save();

  const token = jwt.sign(
    { id: admin._id, role: admin.role || 'admin' },
    process.env.JWT_SECRET,
    { expiresIn: '30m' }
  );

  const info = getDeviceInfo(req);
  Promise.resolve().then(() => {
    sendEmail(process.env.ADMIN_ALERT_EMAIL, 'Admin Panel Accessed', loginAlertTemplate(info))
      .catch((err) => console.error('Login alert failed:', err));
  });

  res.json({ token });
};
