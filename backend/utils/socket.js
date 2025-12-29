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

// const { Server } = require('socket.io');
// const jwt = require('jsonwebtoken');
// const logger = require('./logger'); // ✅ structured logger

// const allowedOrigins = [
//   'http://localhost:3000',
//   'https://finoqz.com',
//   'https://www.finoqz.com'
// ];

// function initSocket(server) {
//   const io = new Server(server, {
//     cors: {
//       origin: (origin, callback) => {
//         if (!origin || allowedOrigins.includes(origin)) {
//           callback(null, true);
//         } else {
//           callback(new Error('Not allowed by CORS in Socket.io'));
//         }
//       },
//       credentials: true
//     }
//   });

//   // JWT middleware
//   io.use((socket, next) => {
//     const token = socket.handshake.auth?.token;
//     if (!token) return next(new Error('No token provided'));
//     try {
//       const payload = jwt.verify(token, process.env.JWT_SECRET);
//       socket.user = payload;
//       next();
//     } catch (err) {
//       if (err.name === 'TokenExpiredError') {
//         return next(new Error('jwt expired'));
//       }
//       return next(new Error('invalid token'));
//     }
//   });

//   // Connection events
//   io.on('connection', (socket) => {
//     logger.info('🔌 Socket connected', {
//       socketId: socket.id,
//       user: socket.user?.email,
//       ip: socket.handshake.address
//     });

//     socket.on('disconnect', (reason) => {
//       logger.warn('❌ Socket disconnected', { socketId: socket.id, reason });
//     });
//   });

//   // Graceful shutdown
//   process.on('SIGINT', () => {
//     io.close(() => {
//       logger.info('🔌 Socket.io server closed');
//       process.exit(0);
//     });
//   });

//   return io;
// }

// module.exports = initSocket;
const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const logger = require('./logger'); // your structured logger

const allowedOrigins = [
  'http://localhost:3000',
  'https://finoqz.com',
  'https://www.finoqz.com',
];

// Set to "true" if you want to reject sockets without a valid token (will return handshake error)
const STRICT_AUTH = process.env.SOCKET_STRICT_AUTH === 'true';

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
      credentials: true,
    },
    pingTimeout: 30000,
  });

  // Auth middleware: verify token if provided; don't fail handshake for missing/invalid token
  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth?.token || socket.handshake.query?.token;

      if (!token) {
        // No token provided
        socket.isAuthenticated = false;
        socket.user = null;

        if (STRICT_AUTH) {
          // Reject connection with a friendly error (client will receive connection error)
          return next(new Error('No token provided'));
        }

        // Allow connection but mark unauthenticated
        return next();
      }

      // Verify token
      try {
        const payload = jwt.verify(token, process.env.JWT_SECRET);
        socket.isAuthenticated = true;
        socket.user = payload;
        return next();
      } catch (err) {
        // Token invalid or expired
        logger.warn('Socket auth failed', { reason: err.message, socketId: socket.id });

        socket.isAuthenticated = false;
        socket.user = null;
        // Attach authError so connection handler can react
        socket.authError = err.name === 'TokenExpiredError' ? 'jwt expired' : 'invalid token';

        if (STRICT_AUTH) {
          return next(new Error(socket.authError));
        }

        // Allow connection but mark unauthenticated
        return next();
      }
    } catch (err) {
      console.error('Socket auth middleware error', err);
      return next(new Error('Socket auth error'));
    }
  });

  io.on('connection', (socket) => {
    logger.info('🔌 Socket connected', {
      socketId: socket.id,
      user: socket.user?.email || null,
      isAuthenticated: !!socket.isAuthenticated,
      authError: socket.authError || null,
      ip: socket.handshake.address,
    });

    // If not authenticated, notify client (so frontend can handle session / redirect)
    if (!socket.isAuthenticated) {
      socket.emit('unauthenticated', { message: socket.authError || 'no token' });
    }

    // Example protected event handling
    socket.on('protected:event', (payload) => {
      if (!socket.isAuthenticated) {
        // reject or ignore the event if not authenticated
        socket.emit('error', { message: 'authentication required for protected:event' });
        return;
      }
      // handle the event for authenticated users...
    });

    // Example open event
    socket.on('hello', (payload) => {
      socket.emit('hello:ack', { ok: true, you: payload });
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