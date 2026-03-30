
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
  getMonthlyUsers,
  getDashboardStats,
  createGroup,
  getGroups,
  updateGroup,
  deleteGroup,
  getUserGrowthData,
  getLiveUsers
} from '../controllers/adminPanelController.js';
import authMiddleware from '../middlewares/authMiddleware.js';
import requireAdmin from '../middlewares/requireAdmin.js';
import verifyToken from "../middlewares/verifyToken.js";
import upload from '../utils/upload.js';

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

router.post("/send-email", authMiddleware("admin"), requireAdmin, sendBulkEmail);


router.get('/monthly-users', authMiddleware('admin'), requireAdmin, getMonthlyUsers);
router.get('/dashboard-stats', authMiddleware('admin'), requireAdmin, getDashboardStats);

router.post('/groups', authMiddleware('admin'), requireAdmin, createGroup);

router.get('/groups', authMiddleware('admin'), requireAdmin, getGroups);

router.put('/groups/:id', authMiddleware('admin'), requireAdmin, updateGroup);

router.delete('/groups/:id', authMiddleware('admin'), requireAdmin, deleteGroup);

router.get('/analytics/user-growth', authMiddleware('admin'), requireAdmin, getUserGrowthData);

router.get('/analytics/live-users', authMiddleware('admin'), requireAdmin, getLiveUsers);

export default router;
