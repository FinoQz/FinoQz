const express = require('express');

const {
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
  createGroup,
  getGroups,
  updateGroup,
  deleteGroup,
  getUserGrowthData
} = require('../controllers/adminPanelController');

const authMiddleware = require('../middlewares/authMiddleware');
const requireAdmin = require('../middlewares/requireAdmin');
const verifyToken = require("../middlewares/verifyToken");
const upload = require('../utils/upload');

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

router.post("/send-email", verifyToken, requireAdmin, sendBulkEmail);

router.get('/monthly-users', authMiddleware('admin'), requireAdmin, getMonthlyUsers);

router.post('/groups', authMiddleware('admin'), requireAdmin, createGroup);

router.get('/groups', authMiddleware('admin'), requireAdmin, getGroups);

router.put('/groups/:id', authMiddleware('admin'), requireAdmin, updateGroup);

router.delete('/groups/:id', authMiddleware('admin'), requireAdmin, deleteGroup);

router.get('/analytics/user-growth', getUserGrowthData);

module.exports = router;
