import User from '../models/User.js';
import Group from '../models/Group.js';
import bcrypt from "bcrypt";
import sendEmail from '../utils/sendEmail.js';
import approvalSuccessTemplate from '../emailTemplates/userApprovalSuccessTemplate.js';
import newUserWelcomeTemplate from "../emailTemplates/newUserWelcomeTemplate.js";
import rejectionTemplate from '../emailTemplates/userRejectionTemplate.js';
import unblockUserTemplate from "../emailTemplates/unblockUserTemplate.js";
import blockUserTemplate from "../emailTemplates/blockUserTemplate.js";
import adminBulkEmailTemplate from "../emailTemplates/adminBulkEmail.js";
import logActivity from '../utils/logActivity.js';
import emailQueue from '../utils/emailQueue.js';
import userDeletedTemplate from "../emailTemplates/userDeletedTemplate.js";
import cloudinary from '../utils/cloudinary.js';
import redis from '../utils/redis.js';
import mongoose from 'mongoose';


const buildDashboardStats = async () => {
  const [
    totalUsers,
    activeUsers,
    pendingApprovals,
    totalRevenueAgg,
    totalPaidUsers,
    freeQuizAttemptsAgg,
  ] = await Promise.all([
    User.countDocuments({}),
    User.countDocuments({ status: "approved" }),
    User.countDocuments({ status: "awaiting_admin_approval" }),
    User.aggregate([{ $group: { _id: null, total: { $sum: "$totalSpent" } } }]),
    User.countDocuments({ isPaidUser: true }),
    User.aggregate([{ $group: { _id: null, total: { $sum: "$freeQuizAttempts" } } }]),
  ]);

  return {
    totalUsers,
    activeUsers,
    pendingApprovals,
    totalRevenue: (Array.isArray(totalRevenueAgg) && totalRevenueAgg[0]?.total) || 0,
    totalPaidUsers,
    freeQuizAttempts: (Array.isArray(freeQuizAttemptsAgg) && freeQuizAttemptsAgg[0]?.total) || 0,
  };
};

async function emitDashboardStats(req) {
  console.log("📊 emitDashboardStats triggered");

  try {
    const cached = await redis.get("dashboard:stats");
    const io = req.app.get("io");

    if (cached) {
      const stats = JSON.parse(cached);
      if (io) {
        io.to('admin-room').emit('dashboard:stats', stats);
        console.log("📡 Emitted cached dashboard:stats", stats);
      }
      return;
    }

    const stats = await buildDashboardStats();
    await redis.set("dashboard:stats", JSON.stringify(stats), "EX", 60);

    if (io) {
      io.to('admin-room').emit('dashboard:stats', stats);
      console.log("📡 Emitted fresh dashboard:stats", stats);
    }
  } catch (err) {
    console.error("❌ emitDashboardStats error:", err);
  }
}

export { emitDashboardStats };

export const getDashboardStats = async (req, res) => {
  try {
    const cached = await redis.get("dashboard:stats");
    if (cached) {
      return res.json(JSON.parse(cached));
    }

    const stats = await buildDashboardStats();
    await redis.set("dashboard:stats", JSON.stringify(stats), "EX", 60);
    return res.json(stats);
  } catch (err) {
    console.error("❌ getDashboardStats error:", err);
    return res.status(500).json({ message: 'Failed to fetch dashboard stats' });
  }
};

import { emitLiveUserStats, emitAnalyticsUpdate, emitUsersUpdate } from '../utils/emmiters.js';
import userApprovalSuccessTemplate from '../emailTemplates/userApprovalSuccessTemplate.js';

// ✅ Get monthly user registrations (current & last month)
export const getMonthlyUsers = async (req, res) => {
  try {
    const io = req.app.get('io');
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth(); // 0-indexed

    const startOfCurrentMonth = new Date(year, month, 1);
    const startOfLastMonth = new Date(year, month - 1, 1);
    const endOfLastMonth = new Date(year, month, 0);

    const cacheKey = `dashboard:monthlyUsers:${year}-${month + 1}`;

    // ✅ Try cache first
    const cached = await redis.get(cacheKey);
    if (cached) {
      const parsed = JSON.parse(cached);
      if (io) {
        await emitAnalyticsUpdate(io, {
          type: 'monthlyUsers',
          ...parsed,
        });
      }
      return res.json({ type: 'monthlyUsers', ...parsed });
    }

    // 🔍 Fresh counts
    const [currentMonthCount, lastMonthCount] = await Promise.all([
      User.countDocuments({ createdAt: { $gte: startOfCurrentMonth } }),
      User.countDocuments({ createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth } }),
    ]);

    const payload = {
      currentMonth: currentMonthCount,
      lastMonth: lastMonthCount,
    };

    // 💾 Cache for 1 hour
    await redis.set(cacheKey, JSON.stringify(payload), 'EX', 3600);

    // 📡 Emit via WebSocket
    if (io) {
      await emitAnalyticsUpdate(io, {
        type: 'monthlyUsers',
        ...payload,
      });
    }

    return res.json({ type: 'monthlyUsers', ...payload });
  } catch (err) {
    console.error('❌ Error fetching monthly users:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};


export const getUserGrowthData = async (req, res) => {
  try {
    const io = req.app.get('io');
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth(); // 0-indexed
    const startDate = new Date(year, month, 1);
    const endDate = new Date(year, month + 1, 0);
    const cacheKey = `dashboard:userGrowth:${year}-${month + 1}`; // e.g., dashboard:userGrowth:2026-01

    // ✅ Try cache first
    const cached = await redis.get(cacheKey);
    if (cached) {
      const parsed = JSON.parse(cached);
      if (io) {
        await emitAnalyticsUpdate(io, {
          type: 'userGrowth',
          labels: parsed.labels,
          values: parsed.values,
        });
      }
      return res.json({ type: 'userGrowth', ...parsed });
    }

    // 🔍 MongoDB aggregation
    const pipeline = [
      {
        $match: {
          createdAt: {
            $gte: startDate,
            $lte: endDate,
          },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ];

    const results = await User.aggregate(pipeline);
    const resultMap = Object.fromEntries(results.map(r => [r._id, r.count]));

    const labels = [];
    const values = [];
    const totalDays = endDate.getDate();

    for (let i = 1; i <= totalDays; i++) {
      const date = new Date(year, month, i);
      const isoDate = date.toISOString().split('T')[0];
      const label = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

      labels.push(label);
      values.push(resultMap[isoDate] || 0);
    }

    const payload = { labels, values };

    // 💾 Cache for 1 hour
    await redis.set(cacheKey, JSON.stringify(payload), 'EX', 3600);

    // 📡 Emit via WebSocket
    if (io) {
      await emitAnalyticsUpdate(io, {
        type: 'userGrowth',
        labels,
        values,
      });
    }

    return res.json({ type: 'userGrowth', ...payload });
  } catch (err) {
    console.error('❌ Error fetching user growth data:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};



export const getLiveUsers = async (req, res) => {
  try {
    // ✅ Get count from Redis Set
    const liveUserCount = await redis.scard('liveUsers');

    // ✅ Push to sparkline list
    await redis.lpush('liveUserSparkline', liveUserCount);
    await redis.ltrim('liveUserSparkline', 0, 19); // Keep last 20 entries

    // ✅ Fetch sparkline
    const sparklineRaw = await redis.lrange('liveUserSparkline', 0, -1);
    const sparkline = sparklineRaw.map(Number).reverse();

    const data = {
      type: 'liveUsers',
      liveUsers: liveUserCount,
      sparkline,
    };

    // ✅ Emit to admin-room
    const io = req.app.get('io');
    if (io) {
      await emitLiveUserStats(io);
    }

    return res.json(data);
  } catch (err) {
    console.error('❌ Live user fetch error:', err);
    return res.status(500).json({ message: 'Failed to fetch live users' });
  }
};

// ✅ Get all users

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({})
      .select('_id fullName email mobile status createdAt lastLoginAt')
      .sort({ createdAt: -1 });

    const formatted = users.map(u => ({
      _id: u._id,
      fullName: u.fullName,
      email: u.email,
      mobile: u.mobile || 'N/A',
      status: u.status === 'approved' ? 'Active' : 'Inactive',
      createdAt: u.createdAt ? u.createdAt.toISOString() : null,
      lastLoginAt: u.lastLoginAt
        ? u.lastLoginAt.toISOString()
        : (u.createdAt ? u.createdAt.toISOString() : null)
    }));

    return res.json(formatted);

  } catch (err) {
    console.error("❌ getAllUsers error:", err);
    return res.status(500).json({ message: "Server error fetching users" });
  }
};


export const approveUser = async (req, res) => {
  const { userId } = req.params;

  try {
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'Invalid user ID format' });
    }

    console.log("➡️ Admin approving user:", userId);

    const user = await User.findById(userId);
    if (!user) {
      console.log("❌ User not found");
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.status !== 'awaiting_admin_approval') {
      console.log("⚠️ User not in approval queue:", user.status);
      return res.status(400).json({ message: 'User is not awaiting approval' });
    }

    user.status = 'approved';
    user.approvedBy = req.adminId;
    user.approvedAt = new Date();

    const savedUser = await user.save();

    console.log("✅ User approved:", {
      id: savedUser._id.toString(),
      approvedAt: savedUser.approvedAt,
      approvedBy: savedUser.approvedBy?.toString(),
    });

    await logActivity({
      req,
      actorType: "admin",
      actorId: req.adminId,
      action: "approve_user",
      meta: { userId: savedUser._id.toString() }
    });

    await emitDashboardStats(req);
    await emitUsersUpdate(req);

    // ✅ Use email queue instead of direct sendEmail
    await emailQueue.add("userApproved", {
      to: savedUser.email,
      subject: "FinoQz Account Approved",
      html: userApprovalSuccessTemplate({
        fullName: savedUser.fullName,
        email: savedUser.email,
        password: 'Your chosen password'
      }),
    });

    res.json({
      message: 'User approved successfully',
      user: {
        _id: savedUser._id,
        fullName: savedUser.fullName,
        email: savedUser.email,
        approvedAt: savedUser.approvedAt,
        approvedBy: savedUser.approvedBy,
        status: savedUser.status,
      }
    });

  } catch (err) {
    console.error('❌ Error approving user:', err);
    res.status(500).json({ message: 'Server error during approval' });
  }
};



// ✅ Reject a user
export const rejectUser = async (req, res) => {
  const { userId } = req.params;

  try {
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'Invalid user ID format' });
    }

    const user = await User.findById(userId);
    if (!user || user.status !== 'awaiting_admin_approval') {
      return res.status(400).json({ message: 'Invalid user or status' });
    }

    user.status = 'rejected';
    user.rejectedAt = new Date();

    const savedUser = await user.save();

    await logActivity({
      req,
      actorType: "admin",
      actorId: req.adminId,
      action: "reject_user",
      meta: { userId: savedUser._id.toString() }
    });

    await emitDashboardStats(req);
    await emitUsersUpdate(req); // ✅ Added here

    sendEmail(
      savedUser.email,
      'FinoQz Signup Update',
      rejectionTemplate(savedUser.fullName)
    ).catch(err => console.error('📨 Rejection email failed:', err));

    res.json({
      message: 'User rejected successfully',
      user: {
        _id: savedUser._id,
        fullName: savedUser.fullName,
        email: savedUser.email,
        rejectedAt: savedUser.rejectedAt,
        status: savedUser.status,
      }
    });

  } catch (err) {
    console.error('❌ Error rejecting user:', err);
    res.status(500).json({ message: 'Server error during rejection' });
  }
};

// ✅ Get all users awaiting admin approval
export const getPendingUsers = async (req, res) => {
  try {
    const users = await User.find({ status: 'awaiting_admin_approval' })
      .select('_id fullName email mobile createdAt status emailVerified mobileVerified')
      .sort({ createdAt: -1 })
      .limit(60); // ✅ Limit to 60 for performance

    res.json(users);
  } catch (err) {
    console.error("Error fetching pending users:", err);
    res.status(500).json({ message: "Server error" });
  }
};


//  ✅ Get approved users
export const getApprovedUsers = async (req, res) => {
  try {
    const users = await User.find({ status: 'approved' })
      .select('_id fullName email mobile createdAt approvedBy approvedAt') // ✅ added approvedAt
      .sort({ approvedAt: -1 })
      .limit(60); // ✅ Limit to 60 for performance

    res.json(users);
  } catch (err) {
    console.error("Error fetching approved users:", err);
    res.status(500).json({ message: "Server error" });
  }
};

//  ✅ Get rejected users
export const getRejectedUsers = async (req, res) => {
  try {
    const users = await User.find({ status: 'rejected' })
      .select('_id fullName email mobile createdAt')
      .sort({ createdAt: -1 })
      .limit(60); // ✅ Limit to 60 for performance

    res.json(users);
  } catch (err) {
    console.error("Error fetching rejected users:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ GET USER BY ID

export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId)
      .select('-passwordHash -emailOtp -mobileOtp');

    if (!user) return res.status(404).json({ message: "User not found" });

    await logActivity({
      req,
      actorType: "admin",
      actorId: req.adminId,
      action: "view_user_details",
      meta: { userId: user._id }
    });

    res.json(user);
  } catch (err) {
    console.error("❌ getUserById error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ UPDATE USER DETAILS
export const updateUser = async (req, res) => {
  try {
    const updates = req.body;

    const user = await User.findByIdAndUpdate(
      req.params.userId,
      updates,
      { new: true }
    );

    if (!user) return res.status(404).json({ message: "User not found" });

    await logActivity({
      req,
      actorType: "admin",
      actorId: req.adminId,
      action: "update_user",
      meta: { userId: user._id, updates }
    });

    // ✅ Emit updated stats
    await emitDashboardStats(req);
    await emitUsersUpdate(req); // ✅ Add this line


    res.json({ message: "User updated", user });
  } catch (err) {
    console.error("❌ updateUser error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ DELETE USER
export const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);

    if (!user) return res.status(404).json({ message: "User not found" });

    const deletedEmail = user.email;
    const deletedName = user.fullName;

    await User.findByIdAndDelete(req.params.userId);

    await logActivity({
      req,
      actorType: "admin",
      actorId: req.adminId,
      action: "delete_user",
      meta: { userId: user._id, email: deletedEmail }
    });

    // ✅ Send deletion email
    if (deletedEmail) {
      await emailQueue.add("sendMail", {
        to: deletedEmail,
        subject: "Your FinoQz Account Has Been Deleted",
        html: userDeletedTemplate({
          fullName: deletedName,
          email: deletedEmail
        })
      });

      console.log("📨 Deletion email queued for:", deletedEmail);
    }

    // ✅ Emit updated stats
    await emitDashboardStats(req);
    await emitUsersUpdate(req);

    res.json({ message: "User deleted" });
  } catch (err) {
    console.error("❌ deleteUser error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ ADD NEW USER (Admin-created)
export const addNewUser = async (req, res) => {
  try {
    const { fullName, email, mobile, gender, address, role, password } = req.body;

    // ✅ Check if email already exists
    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res.status(409).json({ message: "Email already exists" });
    }

    // ✅ Check if mobile already exists
    const existingMobile = await User.findOne({ mobile });
    if (existingMobile) {
      return res.status(409).json({ message: "Mobile number already registered" });
    }

    // ✅ Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // ✅ Upload profile picture to Cloudinary if provided
    let profilePictureUrl = null;
    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: "profiles",
        public_id: `user_${email}`,
        overwrite: true,
      });
      profilePictureUrl = result.secure_url;
    }

    // ✅ Create new user
    const newUser = new User({
      fullName,
      email,
      mobile,
      gender,
      address,
      role,
      passwordHash,
      status: "approved",
      emailVerified: true,
      mobileVerified: true,
      profilePicture: profilePictureUrl,
    });

    await newUser.save();

    // ✅ Log activity
    await logActivity({
      req,
      actorType: "admin",
      actorId: req.adminId,
      action: "add_new_user",
      meta: { userId: newUser._id, email, mobile },
    });

    // ✅ Emit real-time dashboard stats
    await emitDashboardStats(req);
    await emitUsersUpdate(req);   

    // ✅ Queue welcome email
    try {
      await emailQueue.add("newUserWelcome", {
        to: email,
        subject: "Welcome to FinoQz — Your Account Details",
        html: newUserWelcomeTemplate({ fullName, email, password }),
      });
    } catch (queueErr) {
      console.error("❌ newUserWelcome queue error:", queueErr);
    }

    return res.json({ message: "User created successfully", user: newUser });
  } catch (err) {
    console.error("Add user error:", err);
    return res.status(500).json({ message: "Server error adding user" });
  }
};

// ✅ BLOCK USER
export const blockUser = async (req, res) => {
  try {
    const userId = req.params.userId;

    const user = await User.findByIdAndUpdate(
      userId,
      { status: "blocked" },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    await emailQueue.add("sendMail", {
      to: user.email,
      subject: "Your Account Has Been Blocked",
      html: blockUserTemplate(user.fullName),
    });

    await emitDashboardStats(req);
    await emitUsersUpdate(req); // ✅ Real-time update

    return res.json({ message: "User blocked & email sent", user });
  } catch (err) {
    console.error("Block user error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// ✅ UNBLOCK USER
export const unblockUser = async (req, res) => {
  try {
    const userId = req.params.userId;

    const user = await User.findByIdAndUpdate(
      userId,
      { status: "approved" },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    await emailQueue.add("sendMail", {
      to: user.email,
      subject: "Your Account Has Been Unblocked",
      html: unblockUserTemplate(user.fullName),
    });

    // ✅ Emit updated stats
    await emitDashboardStats(req);
    await emitUsersUpdate(req);

    return res.json({ message: "User unblocked & email sent", user });
  } catch (err) {
    console.error("Unblock user error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// GROUP MANAGEMENT
export const createGroup = async (req, res) => {
  try {
    const { name, members } = req.body;
    if (!name || !members || members.length === 0) {
      return res.status(400).json({ message: "Name and members required" });
    }

    const group = new Group({
      name,
      members,
      createdBy: req.adminId || null
    });
    await group.save();
    return res.status(201).json(group);
  } catch (err) {
    console.error("❌ createGroup error:", err);
    return res.status(500).json({ message: "Server error creating group" });
  }
};

// Get all groups
export const getGroups = async (req, res) => {
  try {
    const groups = await Group.find()
      .populate('members', '_id fullName email');
    return res.json(groups);
  } catch (err) {
    console.error("❌ getGroups error:", err);
    return res.status(500).json({ message: "Server error fetching groups" });
  }
};

// Update group
export const updateGroup = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, members } = req.body;
    const group = await Group.findByIdAndUpdate(
      id,
      { name, members },
      { new: true }
    ).populate('members', '_id fullName email');

    if (!group) return res.status(404).json({ message: "Group not found" });
    return res.json(group);
  } catch (err) {
    console.error("❌ updateGroup error:", err);
    return res.status(500).json({ message: "Server error updating group" });
  }
};

// Delete group
export const deleteGroup = async (req, res) => {
  try {
    const { id } = req.params;
    const del = await Group.findByIdAndDelete(id);
    if (!del) return res.status(404).json({ message: "Group not found" });
    return res.json({ message: "Group deleted" });
  } catch (err) {
    console.error("❌ deleteGroup error:", err);
    return res.status(500).json({ message: "Server error deleting group" });
  }
};

// ✅ Send bulk email to users
export const sendBulkEmail = async (req, res) => {
  try {
    const { recipients, subject, body } = req.body;

    if (!recipients || recipients.length === 0) {
      return res.status(400).json({ message: "No recipients provided" });
    }

    if (!subject || !body) {
      return res.status(400).json({ message: "Subject and body are required" });
    }
    console.log("📩 Incoming recipients:", recipients);

    // ✅ Add ONE bulk job to queue
    await emailQueue.add("bulkEmail", {
      recipients,
      subject,
      html: adminBulkEmailTemplate(body),
    });

    return res.json({
      message: `Bulk email queued for ${recipients.length} users`,
    });
  } catch (err) {
    console.error("Bulk email error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};







