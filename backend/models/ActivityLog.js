// const mongoose = require('mongoose');

// const activityLogSchema = new mongoose.Schema({
//   actorType: { type: String, enum: ['admin', 'user'], required: true },
//   actorId: { type: mongoose.Schema.Types.ObjectId, required: false },

//   action: { type: String, required: true },


//   ip: String,

//   // ✅ FIXED: device is an object, not string
//   device: { type: Object, default: {} },

//   userAgent: String,

//   meta: { type: Object, default: {} },

//   createdAt: { type: Date, default: Date.now, expires: 604800 } // 7 days in seconds

// });

// module.exports = mongoose.model('ActivityLog', activityLogSchema);
const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema({
  actorType: { type: String, enum: ['admin', 'user'], required: true },
  actorId: { type: mongoose.Schema.Types.ObjectId, refPath: 'actorType', required: false },

  action: { type: String, required: true },
  category: { type: String, enum: ['auth', 'profile', 'system', 'other'], default: 'other' },

  status: { type: String, enum: ['success', 'failure'], default: 'success' },

  ip: String,
  device: { type: Object, default: {} },
  userAgent: String,

  meta: { type: Object, default: {} },

  createdAt: { type: Date, default: Date.now, expires: 604800 } // TTL: 7 days
}, { timestamps: true });

// ✅ Compound index for faster queries
activityLogSchema.index({ actorType: 1, actorId: 1, action: 1 });

module.exports = mongoose.model('ActivityLog', activityLogSchema);
