const express = require('express');
const {
  getPendingUsers,
  approveUser,
  rejectUser
} = require('../controllers/adminPanelController');

const authMiddleware = require('../middlewares/authMiddleware');
const requireAdmin = require('../middlewares/requireAdmin');

const router = express.Router();

// 🔍 Get all users awaiting approval
router.get('/pending-users', authMiddleware, requireAdmin, getPendingUsers);

// ✅ Approve a user
router.post('/approve/:userId', authMiddleware, requireAdmin, approveUser);

// ❌ Reject a user
router.post('/reject/:userId', authMiddleware, requireAdmin, rejectUser);

module.exports = router;
