const express = require('express');
const router = express.Router();

const {
  getUserNotifications,
  markAllAsRead
} = require('../controllers/notificationController');

// TODO: replace with your actual auth middleware paths
const auth = require('../middlewares/authMiddleware');

router.get('/', auth, getUserNotifications);
router.patch('/read-all', auth, markAllAsRead);

module.exports = router;
