const express = require('express');
const { getActivityLogs, clearAllLogs } = require('../controllers/activityLogController');
const authMiddleware = require('../middlewares/authMiddleware');
const requireAdmin = require('../middlewares/requireAdmin');

const router = express.Router();

router.get('/', authMiddleware('admin'), requireAdmin, getActivityLogs);

// ✅ NEW CLEAR LOGS ROUTE
router.delete('/clear', authMiddleware('admin'), requireAdmin, clearAllLogs);

module.exports = router;
