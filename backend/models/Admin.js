const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema({
  // Identity
  name: { type: String, required: true, trim: true },
  email: {
    type: String,
    unique: true,
    required: true,
    lowercase: true,
    trim: true,
    match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  },
  username: {
    type: String,
    unique: true,
    required: true,
    trim: true,
    minlength: 4
  },

  // Auth
  password: { type: String, required: true }, // hashed
  otp: String,
  otpExpires: Date,

  // Role & audit
  role: { type: String, default: 'admin' },
  lastLoginAt: Date,
  createdAt: { type: Date, default: Date.now }
});


module.exports = mongoose.model('Admin', adminSchema);
