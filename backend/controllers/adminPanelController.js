import User from '../models/User.js';
import Group from '../models/Group.js';
import ScheduledEmail from '../models/ScheduledEmail.js';
import DeletionRequest from '../models/AccountDeletionRequest.js';
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
import { emitDashboardStats, getDashboardStats, getMonthlyUsers } from './dashboardAnalyticsController.js';
export { emitDashboardStats, getDashboardStats, getMonthlyUsers };
import cloudinary from '../utils/cloudinary.js';
import redis from '../utils/redis.js';
import mongoose from 'mongoose';
import Groq from 'groq-sdk';
import fs from 'fs';
import crypto from 'crypto';
import MediaVault from '../models/MediaVault.js';

let groqClient = null;
const getGroqClient = () => {
  if (!process.env.GROQ_API_KEY) {
    throw new Error('GROQ_API_KEY is not set');
  }
  if (!groqClient) {
    groqClient = new Groq({ apiKey: process.env.GROQ_API_KEY });
  }
  return groqClient;
};



import { emitLiveUserStats, emitAnalyticsUpdate, emitUsersUpdate } from '../utils/emmiters.js';
import userApprovalSuccessTemplate from '../emailTemplates/userApprovalSuccessTemplate.js';







export const getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = "", status = "All" } = req.query;
    const pageNumber = parseInt(page, 10) || 1;
    const pageSize = parseInt(limit, 10) || 10;

    // 1. Match constraints
    const matchStage = {};
    
    // Search
    if (search.trim()) {
      matchStage.$or = [
        { fullName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { mobile: { $regex: search, $options: "i" } }
      ];
    }

    // Status filter mapping (frontend -> backend enum mapping)
    if (status !== "All") {
      if (status === "Active") matchStage.status = "approved";
      else if (status === "Inactive") matchStage.status = { $ne: "approved" };
      else if (status === "Blocked") matchStage.status = "blocked";
    }

    // 2. Build Aggregation Pipeline
    const pipeline = [
      { $match: matchStage },
      { $sort: { createdAt: -1 } },
      { $skip: (pageNumber - 1) * pageSize },
      { $limit: pageSize },
      // Lookup wallet balance
      {
        $lookup: {
          from: "wallets",
          localField: "_id",
          foreignField: "userId",
          as: "walletData"
        }
      },
      // Flatten wallet data
      {
        $addFields: {
          walletBalance: {
            $ifNull: [{ $arrayElemAt: ["$walletData.balance", 0] }, 0]
          }
        }
      },
      {
        $project: {
          _id: 1,
          fullName: 1,
          email: 1,
          mobile: 1,
          status: 1,
          createdAt: 1,
          lastLoginAt: 1,
          walletBalance: 1
        }
      }
    ];

    const [users, totalCount] = await Promise.all([
      User.aggregate(pipeline),
      User.countDocuments(matchStage)
    ]);

    const formatted = users.map(u => ({
      _id: u._id,
      fullName: u.fullName,
      email: u.email,
      mobile: u.mobile || 'N/A',
      status: u.status === 'approved' ? 'Active' : u.status === 'blocked' ? 'Blocked' : 'Inactive',
      registrationDate: u.createdAt ? new Date(u.createdAt).toISOString() : "N/A",
      lastLogin: u.lastLoginAt ? new Date(u.lastLoginAt).toISOString() : (u.createdAt ? new Date(u.createdAt).toISOString() : "N/A"),
      walletBalance: u.walletBalance
    }));

    return res.json({
      users: formatted,
      totalCount,
      totalPages: Math.ceil(totalCount / pageSize),
      currentPage: pageNumber
    });

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
    const { fullName, email, mobile, password } = req.body;

    if (!fullName || !email || !mobile || !password) {
      return res.status(400).json({ message: "Full name, email, mobile and password are required" });
    }

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

    // ✅ Create new user in verification-required state
    const newUser = new User({
      fullName,
      email,
      mobile,
      role: "user",
      passwordHash,
      status: "pending_email_verification",
      emailVerified: false,
      mobileVerified: false,
      createdByAdmin: true,
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

    return res.json({
      message: "User created successfully. User can login with credentials and complete OTP verification.",
      user: newUser
    });
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

// ✅ SCHEDULED EMAIL FUNCTIONS

// Create/Schedule an email


// Get all scheduled emails for admin
export const getScheduledEmails = async (req, res) => {
  try {
    const scheduledEmails = await ScheduledEmail.find({ createdBy: req.adminId })
      .populate('recipients', 'fullName email')
      .sort({ createdAt: -1 });

    res.json(scheduledEmails);
  } catch (err) {
    console.error('❌ Get scheduled emails error:', err);
    res.status(500).json({ message: 'Failed to fetch scheduled emails' });
  }
};

// Update scheduled email (only if pending)
export const updateScheduledEmail = async (req, res) => {
  try {
    const { scheduledEmailId } = req.params;
    const { subject, body, recipients, scheduledFor } = req.body;

    const scheduledEmail = await ScheduledEmail.findById(scheduledEmailId);
    if (!scheduledEmail) {
      return res.status(404).json({ message: 'Scheduled email not found' });
    }

    if (scheduledEmail.status !== 'pending') {
      return res.status(400).json({ message: 'Can only edit pending scheduled emails' });
    }

    if (scheduledFor) {
      const scheduledDate = new Date(scheduledFor);
      if (scheduledDate < new Date()) {
        return res.status(400).json({ message: 'Cannot schedule email for past date/time' });
      }
      scheduledEmail.scheduledFor = scheduledDate;
    }

    if (subject) scheduledEmail.subject = subject;
    if (body) scheduledEmail.body = body;

    if (recipients && recipients.length > 0) {
      const users = await User.find({ _id: { $in: recipients } }).select('email');
      scheduledEmail.recipientEmails = users.map(u => u.email);
      scheduledEmail.recipients = recipients;
    }

    // Remove old delayed job (if present) and re-schedule with latest data.
    if (scheduledEmail.jobId) {
      const existingJob = await emailQueue.getJob(scheduledEmail.jobId);
      if (existingJob) {
        await existingJob.remove();
      }
    }

    const delayMs = Math.max(0, new Date(scheduledEmail.scheduledFor).getTime() - Date.now());
    const rescheduledJob = await emailQueue.add(
      'scheduledBulkEmail',
      {
        scheduledEmailId: String(scheduledEmail._id),
      },
      {
        delay: delayMs,
        jobId: `scheduled-email-${scheduledEmail._id}`,
      }
    );

    scheduledEmail.jobId = String(rescheduledJob.id);

    await scheduledEmail.save();

    res.json({
      message: 'Scheduled email updated successfully',
      scheduledEmail,
    });
  } catch (err) {
    console.error('❌ Update scheduled email error:', err);
    res.status(500).json({ message: 'Failed to update scheduled email' });
  }
};

// Cancel scheduled email
export const cancelScheduledEmail = async (req, res) => {
  try {
    const { scheduledEmailId } = req.params;

    const scheduledEmail = await ScheduledEmail.findById(scheduledEmailId);
    if (!scheduledEmail) {
      return res.status(404).json({ message: 'Scheduled email not found' });
    }

    if (scheduledEmail.status !== 'pending') {
      return res.status(400).json({ message: 'Can only cancel pending scheduled emails' });
    }

    if (scheduledEmail.jobId) {
      const existingJob = await emailQueue.getJob(scheduledEmail.jobId);
      if (existingJob) {
        await existingJob.remove();
      }
    }

    await ScheduledEmail.deleteOne({ _id: scheduledEmailId });

    res.json({
      message: 'Scheduled email cancelled and removed successfully',
    });
  } catch (err) {
    console.error('❌ Cancel scheduled email error:', err);
    res.status(500).json({ message: 'Failed to cancel scheduled email' });
  }
};

// Delete scheduled email (remove from card/list)
export const deleteScheduledEmail = async (req, res) => {
  try {
    const { scheduledEmailId } = req.params;

    const scheduledEmail = await ScheduledEmail.findById(scheduledEmailId);
    if (!scheduledEmail) {
      return res.status(404).json({ message: 'Scheduled email not found' });
    }

    if (String(scheduledEmail.createdBy) !== String(req.adminId)) {
      return res.status(403).json({ message: 'Not allowed to delete this scheduled email' });
    }

    if (scheduledEmail.jobId) {
      const existingJob = await emailQueue.getJob(scheduledEmail.jobId);
      if (existingJob) {
        await existingJob.remove();
      }
    }

    await ScheduledEmail.deleteOne({ _id: scheduledEmailId });

    return res.json({ message: 'Scheduled email deleted successfully' });
  } catch (err) {
    console.error('❌ Delete scheduled email error:', err);
    return res.status(500).json({ message: 'Failed to delete scheduled email' });
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

/**
 * Smart Cloudinary Upload with Fingerprint Deduplication
 */
const getSmartCloudinaryUrl = async (file) => {
  if (!file) return null;

  try {
    const fileBuffer = fs.readFileSync(file.path);
    const hash = crypto.createHash('sha256').update(fileBuffer).digest('hex');

    // 1. Check Vault
    const existing = await MediaVault.findOne({ fileHash: hash });
    if (existing) {
      // Cleanup the temp file since we don't need to upload
      if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
      return existing.cloudinaryUrl;
    }

    // 2. Upload to Cloudinary
    const result = await cloudinary.uploader.upload(file.path, {
      folder: 'finoqz/campaigns',
      resource_type: 'auto',
    });

    // 3. Store in Vault
    await MediaVault.create({
      fileHash: hash,
      cloudinaryUrl: result.secure_url,
      publicId: result.public_id,
      originalName: file.originalname,
      fileSize: file.size,
      contentType: file.mimetype,
    });

    // Cleanup temp file
    if (fs.existsSync(file.path)) fs.unlinkSync(file.path);

    return result.secure_url;
  } catch (err) {
    console.error("Smart upload error:", err);
    return null;
  }
};

// ✅ Send bulk email to users
export const sendBulkEmail = async (req, res) => {
  try {
    const { recipients, subject, body, ctaText, ctaUrl } = req.body;

    // Multi-field files from Multer
    const heroImageFile = req.files?.heroImage?.[0];
    const attachmentFiles = req.files?.attachments || [];

    if (!recipients || (Array.isArray(recipients) && recipients.length === 0)) {
      return res.status(400).json({ message: "No recipients provided" });
    }

    if (!subject || !body) {
      return res.status(400).json({ message: "Subject and body are required" });
    }

    // Process Hero Image (File -> Smart Cloudinary URL / Deduplication)
    const finalHeroImageUrl = await getSmartCloudinaryUrl(heroImageFile);

    const attachments = attachmentFiles.map(file => ({
      filename: file.originalname,
      path: file.path,
      contentType: file.mimetype
    }));

    // ✅ Add ONE bulk job to queue
    await emailQueue.add("bulkEmail", {
      recipients,
      subject,
      html: adminBulkEmailTemplate({ message: body, heroImage: finalHeroImageUrl, ctaText, ctaUrl }),
      attachments
    });

    return res.json({
      message: `Bulk email queued with ${attachments.length} attachments`,
    });
  } catch (err) {
    console.error("Bulk email error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const generateBulkEmailDraft = async (req, res) => {
  try {
    const { prompt } = req.body;

    if (!prompt || !String(prompt).trim()) {
      return res.status(400).json({ message: 'Prompt is required' });
    }

    const groq = getGroqClient();
    const fullPrompt = `You are an email writing assistant for a finance learning platform named FinoQz.
Generate a professional bulk-email draft based on the user prompt.

User prompt:
${String(prompt).trim()}

Return ONLY valid JSON with this exact shape:
{
  "subject": "...",
  "body": "..."
}

Rules:
- Keep subject concise and clear.
- Body should be polite, readable, and ready to send.
- Do not include markdown, code fences, or extra keys.`;

    const modelsToTry = [
      'llama-3.3-70b-versatile',
      'llama-3.1-8b-instant',
      'gemma-7b-it',
      'mixtral-8x7b-32768',
    ];

    let content = '';
    let lastError = null;

    for (const modelName of modelsToTry) {
      try {
        const completion = await groq.chat.completions.create({
          model: modelName,
          temperature: 0.6,
          max_tokens: 700,
          messages: [{ role: 'user', content: fullPrompt }],
        });
        content = completion.choices?.[0]?.message?.content || '';
        if (content.trim()) break;
      } catch (err) {
        lastError = err;
      }
    }

    if (!content.trim()) {
      console.error('generateBulkEmailDraft model failure:', lastError);
      return res.status(500).json({ message: 'AI service unavailable. Please try again.' });
    }

    if (content.startsWith('```json')) {
      content = content.slice(7, -3).trim();
    } else if (content.startsWith('```')) {
      content = content.slice(3, -3).trim();
    }

    let parsed;
    try {
      parsed = JSON.parse(content);
    } catch {
      const subjectMatch = content.match(/subject\s*:\s*(.+)/i);
      const bodyMatch = content.match(/body\s*:\s*([\s\S]+)/i);

      const fallbackSubject = subjectMatch?.[1]?.trim();
      const fallbackBody = bodyMatch?.[1]?.trim() || content.trim();

      parsed = {
        subject: fallbackSubject || 'Important update from FinoQz',
        body: fallbackBody,
      };
    }

    const subject = String(parsed?.subject || '').trim();
    const body = String(parsed?.body || '').trim();

    if (!subject || !body) {
      return res.status(500).json({ message: 'AI could not generate a valid email draft' });
    }


    return res.json({ subject, body });
  } catch (err) {
    console.error('generateBulkEmailDraft error:', err);
    return res.status(500).json({ message: 'Failed to generate email draft' });
  }
};

// ✅ Schedule email for later
export const scheduleEmail = async (req, res) => {
  try {
    const { recipients, recipientEmails, subject, body, scheduledFor, ctaText, ctaUrl } = req.body;
    const heroImageFile = req.files?.heroImage?.[0];
    const attachmentFiles = req.files?.attachments || [];

    if (!subject || !body || !scheduledFor) {
      return res.status(400).json({ message: "Incomplete schedule data" });
    }

    const finalHeroImageUrl = await getSmartCloudinaryUrl(heroImageFile);

    const attachments = attachmentFiles.map(file => ({
      filename: file.originalname,
      path: file.path,
      contentType: file.mimetype
    }));

    const scheduledEmail = await ScheduledEmail.create({
      subject,
      body,
      recipients: Array.isArray(recipients) ? recipients : (recipients ? [recipients] : []),
      recipientEmails: Array.isArray(recipientEmails) ? recipientEmails : (recipientEmails ? [recipientEmails] : []),
      scheduledFor: new Date(scheduledFor),
      createdBy: req.user._id,
      heroImage: finalHeroImageUrl,
      ctaText,
      ctaUrl,
      attachments
    });

    const delayMs = Math.max(0, new Date(scheduledFor).getTime() - Date.now());
    const job = await emailQueue.add(
      "scheduledBulkEmail",
      { scheduledEmailId: String(scheduledEmail._id) },
      { delay: delayMs, jobId: `scheduled-email-${scheduledEmail._id}` }
    );

    scheduledEmail.jobId = String(job.id);
    await scheduledEmail.save();

    return res.json({ message: "Email scheduled successfully", scheduledEmail });
  } catch (err) {
    console.error("Scheduling error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};





// ✅ GET ALL DELETION REQUESTS
export const getDeletionRequests = async (req, res) => {
  try {
    const requests = await DeletionRequest.find({ status: 'pending' })
      .populate('user', 'fullName email mobile status')
      .sort({ requestedAt: -1 });

    res.json(requests);
  } catch (err) {
    console.error("❌ getDeletionRequests error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ APPROVE DELETION REQUEST
export const approveDeletionRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const request = await DeletionRequest.findById(requestId).populate('user');

    if (!request) return res.status(404).json({ message: "Request not found" });
    if (request.status !== 'pending') return res.status(400).json({ message: "Request already processed" });

    const user = request.user;
    if (!user) return res.status(404).json({ message: "User not found" });

    const deletedEmail = user.email;
    const deletedName = user.fullName;

    // 1. Delete the user
    await User.findByIdAndDelete(user._id);

    // 2. Mark request as approved
    request.status = 'approved';
    request.processedAt = new Date();
    request.processedBy = req.adminId;
    await request.save();

    await logActivity({
      req,
      actorType: "admin",
      actorId: req.adminId,
      action: "approve_account_deletion",
      meta: { userId: user._id, email: deletedEmail }
    });

    // 3. Notify User
    await emailQueue.add("sendMail", {
      to: deletedEmail,
      subject: "Your FinoQz Account Has Been Deleted",
      html: userDeletedTemplate({
        fullName: deletedName,
        email: deletedEmail
      })
    });

    // 4. Emit Updates
    await emitDashboardStats(req);
    await emitUsersUpdate(req);

    res.json({ message: "Account deletion approved and processed" });
  } catch (err) {
    console.error("❌ approveDeletionRequest error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ REJECT DELETION REQUEST
export const rejectDeletionRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const request = await DeletionRequest.findById(requestId);

    if (!request) return res.status(404).json({ message: "Request not found" });

    request.status = 'rejected';
    request.processedAt = new Date();
    request.processedBy = req.adminId;
    await request.save();

    res.json({ message: "Deletion request rejected" });
  } catch (err) {
    console.error("❌ rejectDeletionRequest error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
