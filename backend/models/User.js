// const mongoose = require('mongoose');

// const userSchema = new mongoose.Schema({
//   // Basic identity
//   fullName: { type: String, required: true, trim: true },

//   email: {
//     type: String,
//     unique: true,          // ✅ Email unique
//     required: true,
//     lowercase: true,
//     trim: true,
//     match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
//   },

//   // Email OTP flow
//   emailOtp: String,
//   emailOtpExpires: Date,
//   emailVerified: { type: Boolean, default: false },

//   // Mobile OTP flow
//   mobile: {
//     type: String,
//     unique: true,          // ✅ Mobile unique
//     sparse: true,          // ✅ Allows null initially
//     trim: true,
//     match: /^[6-9]\d{9}$/  // Indian mobile format
//   },

//   mobileOtp: String,
//   mobileOtpExpires: Date,
//   mobileVerified: { type: Boolean, default: false },

//   // Auth
//   passwordHash: String,

//   // Signup status
//   status: {
//     type: String,
//     enum: [
//       'pending_email_verification',
//       'email_verified',
//       'pending_mobile_verification',
//       'awaiting_admin_approval',
//       'approved',
//       'rejected'
//     ],
//     default: 'pending_email_verification'
//   },

//   lastLoginAt: {
//     type: Date,
//     default: null
//   },

//   createdAt: { type: Date, default: Date.now },
//   approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },

//   profilePicture: { type: String, default: null },
//   gender: String,
//   address: String,
//   role: { type: String, default: "user" },
// });

// module.exports = mongoose.model('User', userSchema);
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  fullName: { type: String, required: true, trim: true },

  email: {
    type: String,
    unique: true,
    required: true,
    lowercase: true,
    trim: true,
    match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  },

  mobile: {
    type: String,
    unique: true,
    sparse: true,
    trim: true,
    match: /^[6-9]\d{9}$/ // Indian mobile format
  },

  // ✅ New fields for profile page
  city: { type: String, trim: true },
  country: { type: String, trim: true },
  dateOfBirth: { type: Date },
  bio: { type: String, maxlength: 500 },

  gender: { type: String, enum: ['Male', 'Female', 'Other'] },

  profilePicture: { type: String, default: null }, // rename to profileImage if you prefer

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

  lastLoginAt: { type: Date, default: null },
  createdAt: { type: Date, default: Date.now },
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },

  role: { type: String, default: "user" }
});

module.exports = mongoose.model('User', userSchema);
