// const { Server } = require('socket.io');
// const jwt = require('jsonwebtoken');

// // Allowed origins for CORS
// const allowedOrigins = [
//   'http://localhost:3000',
//   'https://finoqz.com',
//   'https://www.finoqz.com'
// ];

// function initSocket(server) {
//   const io = new Server(server, {
//     cors: {
//       origin: function (origin, callback) {
//         if (!origin || allowedOrigins.includes(origin)) {
//           callback(null, true);
//         } else {
//           callback(new Error('Not allowed by CORS in Socket.io'));
//         }
//       },
//       credentials: true
//     }
//   });

//   // Middleware for JWT verification
//   io.use((socket, next) => {
//     const token = socket.handshake.auth?.token;
//     if (!token) {
//       return next(new Error('No token provided'));
//     }
//     try {
//       const payload = jwt.verify(token, process.env.JWT_SECRET);
//       socket.user = payload; // attach user payload to socket
//       next();
//     } catch (err) {
//       console.error('JWT verification failed:', err.message);
//       return next(new Error('jwt expired'));
//     }
//   });

//   // Connection events
//   io.on('connection', (socket) => {
//     console.log('🔌 Socket connected:', socket.id, 'User:', socket.user?.email);

//     socket.on('disconnect', () => {
//       console.log('❌ Socket disconnected:', socket.id);
//     });
//   });

//   return io;
// }

// module.exports = initSocket;

const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const logger = require('./logger'); // ✅ structured logger

const allowedOrigins = [
  'http://localhost:3000',
  'https://finoqz.com',
  'https://www.finoqz.com'
];

function initSocket(server) {
  const io = new Server(server, {
    cors: {
      origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
          callback(null, true);
        } else {
          callback(new Error('Not allowed by CORS in Socket.io'));
        }
      },
      credentials: true
    }
  });

  // JWT middleware
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error('No token provided'));
    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET);
      socket.user = payload;
      next();
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        return next(new Error('jwt expired'));
      }
      return next(new Error('invalid token'));
    }
  });

  // Connection events
  io.on('connection', (socket) => {
    logger.info('🔌 Socket connected', {
      socketId: socket.id,
      user: socket.user?.email,
      ip: socket.handshake.address
    });

    socket.on('disconnect', (reason) => {
      logger.warn('❌ Socket disconnected', { socketId: socket.id, reason });
    });
  });

  // Graceful shutdown
  process.on('SIGINT', () => {
    io.close(() => {
      logger.info('🔌 Socket.io server closed');
      process.exit(0);
    });
  });

  return io;
}

module.exports = initSocket;
