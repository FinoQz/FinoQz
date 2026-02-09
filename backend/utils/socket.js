const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const cookie = require('cookie');
const { logger } = require('./logger');
const redis = require('./redis');
const { emitLiveUserStats } = require('./emmiters');


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
    const token = parsedCookies.adminToken;

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
    const isAdmin = user?.role === 'admin';

    logger.info('🔌 Socket connected', {
      socketId: socket.id,
      user: user?.email || null,
      isAuthenticated: !!socket.isAuthenticated,
      authError: socket.authError || null,
      ip: socket.handshake.address,
    });

    if (isAdmin) {
      socket.join('admin-room');
      logger.info('🪑 Joined admin-room', { socketId: socket.id });
    }

    socket.on('disconnect', async (reason) => {
      if (socket.isAuthenticated && !isAdmin && user?._id) {
        await redis.srem('liveUsers', user._id.toString());
        await emitLiveUserStats();
      }
      logger.warn('❌ Socket disconnected', { socketId: socket.id, reason });
    });
  });

  return io;
}




module.exports = {
  initSocket,
};
