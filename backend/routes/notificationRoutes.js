const express = require('express');
const router = express.Router();
const {
  getUserNotifications,
  markAsRead,
  markAllAsRead,
  createNotification,
  deleteNotification
} = require('../controllers/notificationController');
const { celebrate, Joi, Segments } = require('celebrate');
const verifyToken = require('../middlewares/verifyToken');
const verifyAdmin = require('../middlewares/verifyAdmin');

// Get user notifications
router.get('/', verifyToken, getUserNotifications);

// Mark notification as read
router.patch('/:notificationId/read',
  verifyToken,
  celebrate({
    [Segments.PARAMS]: Joi.object({
      notificationId: Joi.string().required()
    })
  }),
  markAsRead
);

// Mark all notifications as read
router.patch('/read-all', verifyToken, markAllAsRead);

// Create notification (Admin only)
router.post('/',
  verifyToken,
  verifyAdmin,
  celebrate({
    [Segments.BODY]: Joi.object({
      userId: Joi.string().required(),
      type: Joi.string().valid('quiz_assigned', 'approval', 'certificate', 'payment', 'system').required(),
      title: Joi.string().required(),
      message: Joi.string().required(),
      metadata: Joi.object().optional()
    })
  }),
  createNotification
);

// Delete notification
router.delete('/:notificationId',
  verifyToken,
  celebrate({
    [Segments.PARAMS]: Joi.object({
      notificationId: Joi.string().required()
    })
  }),
  deleteNotification
);

module.exports = router;
