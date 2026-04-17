
import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import cookie from 'cookie';
import logger from './logger.js';
import redis from './redis.js';
import { emitLiveUserStats } from './emmiters.js';


const allowedOrigins = [
  'http://localhost:3000',
  'https://finoqz.com',
  'https://www.finoqz.com',
  /\.vercel\.app$/, // ✅ wildcard for all Vercel preview URLs
];


const STRICT_AUTH = process.env.SOCKET_STRICT_AUTH !== 'false';

function initSocket(server) {
  const io = new Server(server, {
    cors: {
      origin: function (origin, callback) {
        logger.info('🌐 Incoming socket origin:', { origin });
        if (
          !origin ||
          allowedOrigins.some(o =>
            typeof o === 'string' ? o === origin : o.test(origin)
          )
        ) {
          callback(null, true);
        } else {
          logger.error('❌ Blocked by CORS:', { origin });
          callback(new Error('Not allowed by CORS'));
        }
      },
      credentials: true,
    },
    pingTimeout: 30000,
  });


  io.use((socket, next) => {
    const cookies = socket.handshake.headers.cookie;
    const parsedCookies = cookie.parse(cookies || '');
    // Support both admin and user token
    const token = parsedCookies.adminToken || parsedCookies.userToken || parsedCookies.token;

    if (!token) {
      socket.isAuthenticated = false;
      socket.user = null;
      if (STRICT_AUTH) return next(new Error('No token provided'));
      return next();
    }

    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET);
      socket.isAuthenticated = true;
      socket.user = payload;
      next();
    } catch (err) {
      socket.isAuthenticated = false;
      socket.user = null;
      socket.authError = err.name === 'TokenExpiredError' ? 'jwt expired' : 'invalid token';
      if (STRICT_AUTH) return next(new Error(socket.authError));
      next();
    }
  });

  io.on('connection', async (socket) => {
    const user = socket.user;
    // Admins usually have roles like admin/superadmin/moderator
    const isAdmin = user?.role === 'admin' || user?.role === 'superadmin' || user?.role === 'moderator';

    logger.info('🔌 Socket connected', {
      socketId: socket.id,
      user: user?.email || null,
      isAuthenticated: !!socket.isAuthenticated,
      authError: socket.authError || null,
      ip: socket.handshake.address,
    });

    const validUserId = user?._id || user?.id;

    if (socket.isAuthenticated && validUserId) {
      const userIdStr = validUserId.toString();
      socket.join(`user-${userIdStr}`);
      
      if (isAdmin) {
        socket.join('admin-room');
        logger.info('🪑 Joined admin-room', { socketId: socket.id });
      }

      // Group joins
      socket.on('join_group', (groupId) => {
        socket.join(`group-${groupId}`);
      });

      // Handle sending messages
      socket.on('send_message', async (data) => {
        try {
          const { text, receiverId, groupId } = data;
          const { default: Message } = await import('../models/Message.js');
          
          let senderModel = isAdmin ? 'Admin' : 'User';

          const msgPayload = {
            text,
            sender: userIdStr,
            senderModel,
          };
          
          if (receiverId) {
            msgPayload.receiver = receiverId;
            msgPayload.receiverModel = isAdmin ? 'User' : 'Admin';
          } else if (!isAdmin && !groupId) {
            // User sending to admin-room, no specific admin assigned initially
            msgPayload.receiverModel = 'Admin'; 
          }

          if (groupId) {
            msgPayload.groupId = groupId;
          }

          const newMsg = await Message.create(msgPayload);

          // Forward to groups, or specific user/admin rooms
          if (groupId) {
             io.to(`group-${groupId}`).emit('receive_message', newMsg);
          } else if (receiverId) {
             // To receiver, and to self (for multi-device sync), and to admin-room if interacting with admin
             if (isAdmin) {
               io.to(`user-${receiverId}`).to(`admin-room`).emit('receive_message', newMsg);
             } else {
               io.to('admin-room').to(`user-${userIdStr}`).emit('receive_message', newMsg);
             }
          } else if (!isAdmin && !groupId && !receiverId) {
             // User sending a message to the general admin support channel
             io.to('admin-room').to(`user-${userIdStr}`).emit('receive_message', newMsg);
          }
        } catch (err) {
          console.error("Socket send message error", err);
        }
      });

      // Handle message deletion (admin control / user self-delete)
      socket.on('delete_message', async (msgId) => {
        try {
          const { default: Message } = await import('../models/Message.js');
          const msg = await Message.findById(msgId);
          if (!msg) return;

          // Admins can delete anything. Users can only delete their own messages.
          if (!isAdmin && msg.sender.toString() !== userIdStr) {
            return;
          }

          await Message.findByIdAndUpdate(msgId, { isDeleted: true, text: 'This message was deleted' });
          io.emit('message_deleted', msgId);
        } catch (err) {
          console.error("Socket delete error", err);
        }
      });

      // Handle completely clearing chat (Admin only)
      socket.on('delete_full_chat', async (targetUserId) => {
        if (!isAdmin) return;
        try {
          const { default: Message } = await import('../models/Message.js');
          await Message.deleteMany({
            $or: [
              { sender: targetUserId },
              { receiver: targetUserId }
            ],
            groupId: null
          });
          io.emit('full_chat_deleted', targetUserId);
        } catch (err) {
          console.error("Socket delete full chat error", err);
        }
      });
      
      // typing indicator
      socket.on('typing', ({ receiverId, groupId, isTyping }) => {
         if (groupId) {
            socket.to(`group-${groupId}`).emit('user_typing', { userId: userIdStr, isTyping });
         } else if (receiverId) {
            if (isAdmin) {
               socket.to(`user-${receiverId}`).emit('user_typing', { userId: userIdStr, isTyping });
            } else {
               socket.to('admin-room').emit('user_typing', { userId: userIdStr, isTyping });
            }
         }
      });
    }

    socket.on('disconnect', async (reason) => {
      const validUserId = user?._id || user?.id;
      if (socket.isAuthenticated && !isAdmin && validUserId) {
        await redis.srem('liveUsers', validUserId.toString());
        await emitLiveUserStats(io);
      }
      logger.warn('❌ Socket disconnected', { socketId: socket.id, reason });
    });
  });

  return io;
}




export { initSocket };
