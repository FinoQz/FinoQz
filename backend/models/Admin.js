const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const adminSchema = new mongoose.Schema({
  // 🧑 Identity
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    unique: true,
    required: true,
    lowercase: true,
    trim: true,
    match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  },
  username: {
    type: String,
    unique: true,
    required: true,
    trim: true,
    minlength: 4,
  },

  // 🔐 Auth
  password: {
    type: String,
    required: true, // will be hashed
  },

  // 🛡️ Role & Status
  role: {
    type: String,
    enum: ['superadmin', 'admin', 'moderator'],
    default: 'admin',
  },
  status: {
    type: String,
    enum: ['active', 'suspended'],
    default: 'active',
  },

  // 📅 Activity
  lastLoginAt: Date,
}, {
  timestamps: true, // adds createdAt + updatedAt
  versionKey: false, // removes __v
});

// 🔐 Hash password before saving
adminSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    return next(err);
  }
});

// 🔍 Compare password method
adminSchema.methods.comparePassword = async function (candidatePassword) {
  if (!candidatePassword || !this.password) return false;
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('Admin', adminSchema);
