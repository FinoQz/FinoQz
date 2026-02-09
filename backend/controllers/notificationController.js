const Notification = require('../models/Notification');

/**
 * Get user notifications
 * @route GET /api/notifications
 */
const getUserNotifications = async (req, res) => {
  try {
    const userId = req.user._id;
    const { page = 1, limit = 20, isRead } = req.query;

    const query = { userId };
    
    if (isRead !== undefined) {
      query.isRead = isRead === 'true';
    }

    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await Notification.countDocuments(query);
    const unreadCount = await Notification.countDocuments({ userId, isRead: false });

    res.json({
      notifications,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: count,
      unreadCount
    });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ message: 'Failed to fetch notifications' });
  }
};

/**
 * Mark notification as read
 * @route PATCH /api/notifications/:notificationId/read
 */
const markAsRead = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const userId = req.user._id;

    const notification = await Notification.findOne({ _id: notificationId, userId });
    
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    notification.isRead = true;
    await notification.save();

    res.json({ message: 'Notification marked as read' });
  } catch (error) {
    console.error('Mark as read error:', error);
    res.status(500).json({ message: 'Failed to mark notification as read' });
  }
};

/**
 * Mark all notifications as read
 * @route PATCH /api/notifications/read-all
 */
const markAllAsRead = async (req, res) => {
  try {
    const userId = req.user._id;

    await Notification.updateMany(
      { userId, isRead: false },
      { isRead: true }
    );

    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    console.error('Mark all as read error:', error);
    res.status(500).json({ message: 'Failed to mark all notifications as read' });
  }
};

/**
 * Create a notification (system/admin use)
 * @route POST /api/notifications
 */
const createNotification = async (req, res) => {
  try {
    const { userId, type, title, message, metadata } = req.body;

    if (!userId || !type || !title || !message) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const notification = await Notification.create({
      userId,
      type,
      title,
      message,
      metadata: metadata || {}
    });

    // Emit socket event for real-time notification
    const io = req.app.get('io');
    if (io) {
      io.to(`user-${userId}`).emit('notification:new', notification);
    }

    res.status(201).json({
      message: 'Notification created successfully',
      notification
    });
  } catch (error) {
    console.error('Create notification error:', error);
    res.status(500).json({ message: 'Failed to create notification' });
  }
};

/**
 * Delete a notification
 * @route DELETE /api/notifications/:notificationId
 */
const deleteNotification = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const userId = req.user._id;

    const notification = await Notification.findOneAndDelete({ 
      _id: notificationId, 
      userId 
    });
    
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    res.json({ message: 'Notification deleted successfully' });
  } catch (error) {
    console.error('Delete notification error:', error);
    res.status(500).json({ message: 'Failed to delete notification' });
  }
};

module.exports = {
  getUserNotifications,
  markAsRead,
  markAllAsRead,
  createNotification,
  deleteNotification
};
