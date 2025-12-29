const User = require('../models/User');
const Group = require('../models/Group');
const bcrypt = require("bcrypt");
const sendEmail = require('../utils/sendEmail');
const approvalSuccessTemplate = require('../emailTemplates/userApprovalSuccessTemplate');
const newUserWelcomeTemplate = require("../emailTemplates/newUserWelcomeTemplate");
const rejectionTemplate = require('../emailTemplates/userRejectionTemplate');
const unblockUserTemplate = require("../emailTemplates/unblockUserTemplate");
const blockUserTemplate = require("../emailTemplates/blockUserTemplate");
const adminBulkEmailTemplate = require("../emailTemplates/adminBulkEmail");
const logActivity = require('../utils/logActivity');
const emailQueue = require('../utils/emailQueue');
const userDeletedTemplate = require("../emailTemplates/userDeletedTemplate");
const cloudinary = require('../utils/cloudinary');
const redis = require('../utils/redis');



// 🔁 Helper: emit updated dashboard stats (with Redis cache)
async function emitDashboardStats(req) {
  const io = req.app.get("io");
  if (!io) return;

  try {
    // First check cache
    const cached = await redis.get("dashboard:stats");
    if (cached) {
      const stats = JSON.parse(cached);
      io.emit("dashboard:stats", stats);
      console.log("📡 Emitted cached dashboard:stats", stats);
      return;
    }

    // If cache miss → query DB
    const [totalUsers, activeUsers, pendingApprovals] = await Promise.all([
      User.countDocuments({}),
      User.countDocuments({ status: "approved" }),
      User.countDocuments({ status: "awaiting_admin_approval" }),
    ]);

    const stats = { totalUsers, activeUsers, pendingApprovals };

    // Cache for 60 seconds
    await redis.set("dashboard:stats", JSON.stringify(stats), "EX", 60);

    // Emit to all connected clients
    io.emit("dashboard:stats", stats);

    console.log("📡 Emitted fresh dashboard:stats", stats);
  } catch (err) {
    console.error("❌ emitDashboardStats error:", err);
  }
}



// ✅ Get all users awaiting admin approval
exports.getPendingUsers = async (req, res) => {
  try {
    const users = await User.find({ status: 'awaiting_admin_approval' })
      .select('_id fullName email mobile createdAt status emailVerified mobileVerified')
      .sort({ createdAt: -1 });

    res.json(users);
  } catch (err) {
    console.error("Error fetching pending users:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ Approve a user
exports.approveUser = async (req, res) => {
  const { userId } = req.params;

  try {
    const user = await User.findById(userId);

    if (!user || user.status !== 'awaiting_admin_approval') {
      return res.status(400).json({ message: 'Invalid user or status' });
    }

    user.status = 'approved';
    user.approvedBy = req.adminId;
    await user.save();

    // ✅ Log activity
    await logActivity({
      req,
      actorType: "admin",
      actorId: req.adminId,
      action: "approve_user",
      meta: { userId }
    });

    // ✅ Emit real-time dashboard stats
    await emitDashboardStats(req);

    // ✅ Queue approval email (non-blocking)
    sendEmail(
      user.email,
      'FinoQz Account Approved',
      approvalSuccessTemplate({
        fullName: user.fullName,
        email: user.email,
        password: 'Your chosen password'
      })
    ).catch(err => console.error('Approval email failed:', err));

    res.json({ message: 'User approved' });
  } catch (err) {
    console.error('Error approving user:', err);
    res.status(500).json({ message: 'Server error' });
  }
};


// ✅ Reject a user
exports.rejectUser = async (req, res) => {
  const { userId } = req.params;

  try {
    const user = await User.findById(userId);

    if (!user || user.status !== 'awaiting_admin_approval') {
      return res.status(400).json({ message: 'Invalid user or status' });
    }

    user.status = 'rejected';
    await user.save();

    // ✅ Log activity
    await logActivity({
      req,
      actorType: "admin",
      actorId: req.adminId,
      action: "reject_user",
      meta: { userId }
    });

    // ✅ Emit real-time dashboard stats
    await emitDashboardStats(req);

    // ✅ Queue rejection email (non-blocking)
    sendEmail(
      user.email,
      'FinoQz Signup Update',
      rejectionTemplate(user.fullName)
    ).catch(err => console.error('Rejection email failed:', err));

    res.json({ message: 'User rejected' });
  } catch (err) {
    console.error('Error rejecting user:', err);
    res.status(500).json({ message: 'Server error' });
  }
};


exports.getAllUsers = async (req, res) => {
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
      registrationDate: u.createdAt,
      lastLogin: u.lastLoginAt || u.createdAt
    }));

    return res.json(formatted);

  } catch (err) {
    console.error("❌ getAllUsers error:", err);
    return res.status(500).json({ message: "Server error fetching users" });
  }
};

exports.getApprovedUsers = async (req, res) => {
  try {
    const users = await User.find({ status: 'approved' })
      .select('_id fullName email mobile createdAt approvedBy');

    res.json(users);
  } catch (err) {
    console.error("Error fetching approved users:", err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getRejectedUsers = async (req, res) => {
  try {
    const users = await User.find({ status: 'rejected' })
      .select('_id fullName email mobile createdAt');

    res.json(users);
  } catch (err) {
    console.error("Error fetching rejected users:", err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getUserById = async (req, res) => {
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
exports.updateUser = async (req, res) => {
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

    res.json({ message: "User updated", user });
  } catch (err) {
    console.error("❌ updateUser error:", err);
    res.status(500).json({ message: "Server error" });
  }
};



// ✅ DELETE USER
exports.deleteUser = async (req, res) => {
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

    res.json({ message: "User deleted" });
  } catch (err) {
    console.error("❌ deleteUser error:", err);
    res.status(500).json({ message: "Server error" });
  }
};



// ✅ ADD NEW USER (Admin-created)
exports.addNewUser = async (req, res) => {
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
exports.blockUser = async (req, res) => {
  try {
    const userId = req.params.userId;

    const user = await User.findByIdAndUpdate(
      userId,
      { status: "Inactive" },
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

    // ✅ Emit updated stats
    await emitDashboardStats(req);

    return res.json({ message: "User blocked & email sent", user });
  } catch (err) {
    console.error("Block user error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};


// ✅ UNBLOCK USER
exports.unblockUser = async (req, res) => {
  try {
    const userId = req.params.userId;

    const user = await User.findByIdAndUpdate(
      userId,
      { status: "Active" },
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

    return res.json({ message: "User unblocked & email sent", user });
  } catch (err) {
    console.error("Unblock user error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// GROUP MANAGEMENT
exports.createGroup = async (req, res) => {
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
exports.getGroups = async (req, res) => {
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
exports.updateGroup = async (req, res) => {
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
exports.deleteGroup = async (req, res) => {
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


exports.sendBulkEmail = async (req, res) => {
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

exports.getMonthlyUsers = async (req, res) => {
  try {
    const now = new Date();

    // ✅ Current month start
    const startOfCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // ✅ Last month start & end
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    // ✅ Count users created this month
    const currentMonthCount = await User.countDocuments({
      createdAt: { $gte: startOfCurrentMonth }
    });

    // ✅ Count users created last month
    const lastMonthCount = await User.countDocuments({
      createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth }
    });

    return res.json({
      currentMonth: currentMonthCount,
      lastMonth: lastMonthCount
    });

  } catch (err) {
    console.error("❌ Error fetching monthly users:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};