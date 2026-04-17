import Message from '../models/Message.js';
import Settings from '../models/Settings.js';
import Group from '../models/Group.js';
import User from '../models/User.js';

// GET /api/messages/settings
export const getChatSettings = async (req, res) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) {
      settings = await Settings.create({ globalChatEnabled: true });
    }
    res.json({ globalChatEnabled: settings.globalChatEnabled });
  } catch (error) {
    res.status(500).json({ message: 'Failed to find settings' });
  }
};

// PUT /api/messages/settings (Admin)
export const updateChatSettings = async (req, res) => {
  try {
    const { globalChatEnabled } = req.body;
    let settings = await Settings.findOne();
    if (!settings) {
      settings = new Settings();
    }
    settings.globalChatEnabled = globalChatEnabled;
    await settings.save();
    
    // You'd ideally emit an event to all connected sockets to notify of state change here
    const io = req.app.get('io');
    if (io) {
      io.emit('chat_status_changed', { globalChatEnabled });
    }
    
    res.json({ message: 'Chat settings updated', settings });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update settings' });
  }
};

// GET /api/messages/history (User/Admin)
export const getChatHistory = async (req, res) => {
  try {
    const { userId, groupId } = req.query; // Admin requesting user chats, or User requesting group
    const currentId = req.user._id || req.user.id;
    const role = req.user.role || 'user';
    const isAdmin = role === 'admin' || role === 'superadmin' || role === 'moderator';

    let query = {};
    
    if (groupId) {
      query = { groupId }; // Group Chat History
    } else if (isAdmin && userId) {
      // Admin viewing a specific user's conversation
      query = {
        $or: [
          { sender: userId },
          { receiver: userId }
        ],
        groupId: null
      };
    } else {
      // User viewing their own conversation with Admins
      query = {
        $or: [
          { sender: currentId },
          { receiver: currentId }
        ],
        groupId: null
      };
    }

    const messages = await Message.find(query)
      .sort({ createdAt: 1 }) // Chronological
      .lean();

    res.json({ messages });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch history' });
  }
};

// GET /api/messages/conversations (Admin)
// Retrieves a list of active users that have sent/received messages
export const getActiveConversations = async (req, res) => {
  try {
    const messages = await Message.find({ groupId: null }).sort({ createdAt: -1 }).lean();
    const userMap = new Map();
    
    messages.forEach(msg => {
      // Find the user ID in the message 
      const userId = msg.senderModel === 'User' ? msg.sender.toString() : 
                     (msg.receiverModel === 'User' ? msg.receiver?.toString() : null);
                     
      if (userId && !userMap.has(userId)) {
        userMap.set(userId, {
          userId,
          lastMessage: msg.text,
          lastMessageAt: msg.createdAt,
          isRead: msg.isRead
        });
      }
    });
    
    // Attach basic user data
    const activeUsers = Array.from(userMap.values());
    for(let usr of activeUsers) {
        const uInfo = await User.findById(usr.userId).select('fullName email profilePicture');
        if(uInfo) {
            usr.name = uInfo.fullName || 'Unknown';
            usr.email = uInfo.email;
            usr.profilePicture = uInfo.profilePicture;
        } else {
            usr.name = 'Deleted User';
        }
    }

    res.json({ conversations: activeUsers });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch conversations' });
  }
};
