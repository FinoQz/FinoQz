
import express from 'express';
import {
  getPendingUsers,
  approveUser,
  rejectUser,
  getAllUsers,
  getApprovedUsers,
  getRejectedUsers,
  getUserById,
  updateUser,
  blockUser,
  unblockUser,
  deleteUser,
  addNewUser,
  sendBulkEmail,
  createGroup,
  getGroups,
  updateGroup,
  deleteGroup,
  generateBulkEmailDraft,
  scheduleEmail,
  getScheduledEmails,
  updateScheduledEmail,
  cancelScheduledEmail,
  deleteScheduledEmail,
  getDeletionRequests,
  approveDeletionRequest,
  rejectDeletionRequest
} from '../controllers/adminPanelController.js';
import authMiddleware from '../middlewares/authMiddleware.js';
import requireAdmin from '../middlewares/requireAdmin.js';
import verifyToken from "../middlewares/verifyToken.js";
import upload from '../utils/upload.js';
import emailUpload from '../utils/emailUpload.js';

const router = express.Router();

router.get('/pending-users', authMiddleware('admin'), requireAdmin, getPendingUsers);
router.get('/approved-users', authMiddleware('admin'), requireAdmin, getApprovedUsers);
router.get('/rejected-users', authMiddleware('admin'), requireAdmin, getRejectedUsers);

router.post('/approve/:userId', authMiddleware('admin'), requireAdmin, approveUser);
router.post('/reject/:userId', authMiddleware('admin'), requireAdmin, rejectUser);

router.get('/all-users', authMiddleware('admin'), requireAdmin, getAllUsers);
router.get('/user/:userId', authMiddleware('admin'), requireAdmin, getUserById);

router.put('/user/:userId', authMiddleware('admin'), requireAdmin, updateUser);

router.post('/user/:userId/block', authMiddleware('admin'), requireAdmin, blockUser);
router.post('/user/:userId/unblock', authMiddleware('admin'), requireAdmin, unblockUser);

router.delete('/user/:userId', authMiddleware('admin'), requireAdmin, deleteUser);

router.post("/add-user", authMiddleware("admin"), requireAdmin, upload.single("profilePicture"), addNewUser);

router.post("/send-email", authMiddleware("admin"), requireAdmin, emailUpload.fields([{ name: 'heroImage', maxCount: 1 }, { name: 'attachments' }]), sendBulkEmail);
router.post("/generate-email-draft", authMiddleware("admin"), requireAdmin, generateBulkEmailDraft);

// ✅ Scheduled Email Routes
router.post("/schedule-email", authMiddleware("admin"), requireAdmin, emailUpload.fields([{ name: 'heroImage', maxCount: 1 }, { name: 'attachments' }]), scheduleEmail);
router.get("/scheduled-emails", authMiddleware("admin"), requireAdmin, getScheduledEmails);
router.put("/scheduled-emails/:scheduledEmailId", authMiddleware("admin"), requireAdmin, updateScheduledEmail);
router.post("/scheduled-emails/:scheduledEmailId/cancel", authMiddleware("admin"), requireAdmin, cancelScheduledEmail);
router.delete("/scheduled-emails/:scheduledEmailId", authMiddleware("admin"), requireAdmin, deleteScheduledEmail);



router.post('/groups', authMiddleware('admin'), requireAdmin, createGroup);

router.get('/groups', authMiddleware('admin'), requireAdmin, getGroups);

router.put('/groups/:id', authMiddleware('admin'), requireAdmin, updateGroup);

router.delete('/groups/:id', authMiddleware('admin'), requireAdmin, deleteGroup);

// ✅ Account Deletion Request Routes
router.get('/deletion-requests', authMiddleware('admin'), requireAdmin, getDeletionRequests);
router.post('/deletion-requests/:requestId/approve', authMiddleware('admin'), requireAdmin, approveDeletionRequest);
router.post('/deletion-requests/:requestId/reject', authMiddleware('admin'), requireAdmin, rejectDeletionRequest);


export default router;
