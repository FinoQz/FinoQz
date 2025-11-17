const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  // Basic identity
  fullName: { type: String, required: true, trim: true },
  email: {
    type: String,
    unique: true,
    required: true,
    lowercase: true,
    trim: true,
    match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  },

  // Email OTP flow
  emailOtp: String,
  emailOtpExpires: Date,
  emailVerified: { type: Boolean, default: false },

  // Mobile OTP flow
  mobile: {
    type: String,
    trim: true,
    match: /^[6-9]\d{9}$/ // Indian mobile format
  },
  mobileOtp: String,
  mobileOtpExpires: Date,
  mobileVerified: { type: Boolean, default: false },

  // Auth
  passwordHash: String,

  // Signup status
  status: {
    type: String,
    enum: [
      'pending_email_verification',
      'email_verified',
      'pending_mobile_verification',
      'awaiting_admin_approval',
      'approved',
      'rejected'
    ],
    default: 'pending_email_verification'
  },

  // Audit
  createdAt: { type: Date, default: Date.now },
  lastLoginAt: Date,
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' }
});



module.exports = mongoose.model('User', userSchema);
