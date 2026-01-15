// // 'use strict';

// // const jwt = require('jsonwebtoken');
// // const crypto = require('crypto');

// // function sha256Hex(input) {
// //   return crypto.createHash('sha256').update(String(input || '')).digest('hex');
// // }

// // module.exports = function (requiredRole = null) {
// //   return (req, res, next) => {
// //     try {
// //       const authHeader = req.headers.authorization || req.headers.Authorization;
// //       if (!authHeader || !authHeader.startsWith('Bearer ')) {
// //         return res.status(401).json({ message: 'No token provided' });
// //       }

// //       const token = authHeader.split(' ')[1];
// //       const secret = process.env.JWT_SECRET || process.env.ADMIN_JWT_SECRET;
// //       if (!secret) {
// //         console.error('JWT secret not configured (JWT_SECRET or ADMIN_JWT_SECRET)');
// //         return res.status(500).json({ message: 'Server misconfiguration' });
// //       }

// //       let decoded;
// //       try {
// //         decoded = jwt.verify(token, secret);
// //       } catch (err) {
// //         console.error('JWT verification failed:', err && err.message);
// //         if (err && err.name === 'TokenExpiredError') {
// //           return res.status(401).json({ message: 'Token expired' });
// //         }
// //         return res.status(401).json({ message: 'Invalid token' });
// //       }

// //       // Attach standard fields safely
// //       req.user = decoded;
// //       req.userId = decoded.id || decoded.userId || null;
// //       req.role = decoded.role || null;
// //       // keep adminId for backward compatibility if you need it
// //       if (!req.adminId && decoded.id) req.adminId = decoded.id;

// //       // Role check (if required)
// //       if (requiredRole) {
// //         const tokenRole = (decoded.role || '').toString().toLowerCase();
// //         if (!tokenRole || tokenRole !== requiredRole.toString().toLowerCase()) {
// //           return res.status(403).json({ message: 'Insufficient permissions' });
// //         }
// //       }

// //       // Fingerprint check (optional but recommended)
// //       // Current fingerprint: hash of ip + '|' + user-agent
// //       const userAgent = req.get('user-agent') || '';
// //       const ip = req.ip || req.connection?.remoteAddress || '';
// //       const currentFingerprintHex = sha256Hex(ip + '|' + userAgent);

// //       if (decoded.fingerprint) {
// //         try {
// //           const a = Buffer.from(String(decoded.fingerprint), 'utf8');
// //           const b = Buffer.from(currentFingerprintHex, 'utf8');
// //           // timingSafeEqual needs equal length buffers
// //           if (a.length === b.length) {
// //             if (!crypto.timingSafeEqual(a, b)) {
// //               return res.status(401).json({ message: 'Session invalid. Please login again.' });
// //             }
// //           } else {
// //             // If formats differ (e.g., token has raw fingerprint instead of hex), fall back to simple compare
// //             if (decoded.fingerprint !== currentFingerprintHex) {
// //               return res.status(401).json({ message: 'Session invalid. Please login again.' });
// //             }
// //           }
// //         } catch (err) {
// //           console.warn('Fingerprint compare error', err);
// //           return res.status(401).json({ message: 'Session invalid. Please login again.' });
// //         }
// //       } else {
// //         // Backwards compatibility: token has no fingerprint.
// //         // You may choose to reject such tokens instead of allowing them.
// //         console.warn('Token contains no fingerprint - consider reissuing tokens with fingerprint');
// //         // Optionally: return res.status(401).json({ message: 'Session invalid. Please login again.' });
// //       }

// //       return next();
// //     } catch (err) {
// //       console.error('auth middleware error', err && err.message);
// //       return res.status(500).json({ message: 'Server error' });
// //     }
// //   };
// // };
// 'use strict';

// const jwt = require('jsonwebtoken');
// const crypto = require('crypto');
// const redis = require('../utils/redis');

// function sha256Hex(input) {
//   return crypto.createHash('sha256').update(String(input || '')).digest('hex');
// }

// module.exports = function (requiredRole = null) {
//   return async (req, res, next) => {
//     try {
//       const authHeader = req.headers.authorization || req.headers.Authorization;
//       let token;

//       if (authHeader && authHeader.startsWith('Bearer ')) {
//         token = authHeader.split(' ')[1];
//       } else if (req.cookies?.userToken) {
//         token = req.cookies.userToken;
//       } else if (req.cookies?.adminToken) {
//         token = req.cookies.adminToken;
//       } else {
//         console.warn('🔒 No Authorization header or cookie token found');
//         return res.status(401).json({ message: 'No token provided' });
//       }

//       const secret = process.env.JWT_SECRET || process.env.ADMIN_JWT_SECRET;
//       if (!secret) {
//         console.error('❌ JWT secret not configured');
//         return res.status(500).json({ message: 'Server misconfiguration' });
//       }

//       // 🧪 Decode token without verifying to inspect iat/exp
//       const decodedRaw = jwt.decode(token);
//       if (decodedRaw) {
//         console.log('🧪 Decoded (no verify):', decodedRaw);
//         console.log('🧪 iat:', new Date(decodedRaw.iat * 1000).toLocaleString());
//         console.log('🧪 exp:', new Date(decodedRaw.exp * 1000).toLocaleString());
//         console.log('🕒 Server time at verify:', new Date().toLocaleString());
//       } else {
//         console.warn('⚠️ Unable to decode token');
//       }

//       let decoded;
//       try {
//         decoded = jwt.verify(token, secret, { clockTolerance: 60 }); // ✅ 60s leeway
//         console.log('✅ JWT Verified & Decoded:', decoded);
//       } catch (err) {
//         console.error('❌ JWT verification failed:', err?.message);
//         if (err?.name === 'TokenExpiredError') {
//           return res.status(401).json({ message: 'Token expired' });
//         }
//         return res.status(401).json({ message: 'Invalid token' });
//       }

//       // ✅ Redis session check
//       const redisKey = `session:${decoded.id}`;
//       const storedToken = await redis.get(redisKey);
//       console.log('📦 Redis Token:', storedToken);

//       if (!storedToken || storedToken !== token) {
//         console.warn('❌ Token not found or mismatched in Redis');
//         return res.status(401).json({ message: 'Session expired or invalid' });
//       }

//       // ✅ Fingerprint check
//       const userAgent = req.get('user-agent') || '';
//       const ip = req.ip || req.connection?.remoteAddress || '';
//       const currentFingerprintHex = sha256Hex(ip + '|' + userAgent);

//       console.log('🧠 Current Fingerprint:', currentFingerprintHex);
//       console.log('🧠 Token Fingerprint:', decoded.fingerprint);

//       if (decoded.fingerprint) {
//         try {
//           const a = Buffer.from(String(decoded.fingerprint), 'utf8');
//           const b = Buffer.from(currentFingerprintHex, 'utf8');

//           if (a.length === b.length) {
//             if (!crypto.timingSafeEqual(a, b)) {
//               console.warn('❌ Fingerprint mismatch (timingSafeEqual)');
//               return res.status(401).json({ message: 'Session fingerprint mismatch' });
//             }
//           } else {
//             if (decoded.fingerprint !== currentFingerprintHex) {
//               console.warn('❌ Fingerprint mismatch (fallback compare)');
//               return res.status(401).json({ message: 'Session fingerprint mismatch' });
//             }
//           }
//         } catch (err) {
//           console.warn('⚠️ Fingerprint compare error:', err);
//           return res.status(401).json({ message: 'Session fingerprint mismatch' });
//         }
//       } else {
//         console.warn('⚠️ Token missing fingerprint — consider reissuing');
//         return res.status(401).json({ message: 'Session fingerprint missing' });
//       }

//       // ✅ Attach user info
//       req.user = decoded;
//       req.userId = decoded.id || decoded.userId || null;
//       req.role = decoded.role || null;
//       if (!req.adminId && decoded.id) req.adminId = decoded.id;

//       // ✅ Role check
//       if (requiredRole) {
//         const tokenRole = (decoded.role || '').toLowerCase();
//         console.log('🔐 Required Role:', requiredRole, '| Token Role:', tokenRole);
//         if (tokenRole !== requiredRole.toLowerCase()) {
//           return res.status(403).json({ message: 'Insufficient permissions' });
//         }
//       }

//       console.log('✅ Authenticated user:', decoded.id);
//       return next();
//     } catch (err) {
//       console.error('❌ auth middleware error:', err?.message);
//       return res.status(500).json({ message: 'Server error' });
//     }
//   };
// };
// 'use strict';

// const jwt = require('jsonwebtoken');
// const crypto = require('crypto');
// const redis = require('../utils/redis');

// function sha256Hex(input) {
//   return crypto.createHash('sha256').update(String(input || '')).digest('hex');
// }

// module.exports = function (requiredRole = null) {
//   return async (req, res, next) => {
//     try {
//       // 🔐 Extract token from header or cookies
//       const authHeader = req.headers.authorization || req.headers.Authorization;
//       let token =
//         (authHeader && authHeader.startsWith('Bearer ') && authHeader.split(' ')[1]) ||
//         req.cookies?.adminToken ||
//         req.cookies?.userToken;

//       if (!token) {
//         console.warn('🔒 No token found in headers or cookies');
//         return res.status(401).json({ message: 'No token provided' });
//       }

//       const secret = process.env.JWT_SECRET || process.env.ADMIN_JWT_SECRET;
//       if (!secret) {
//         console.error('❌ JWT secret not configured');
//         return res.status(500).json({ message: 'Server misconfiguration' });
//       }

//       // 🧪 Decode (non-verified) for debug
//       const decodedRaw = jwt.decode(token);
//       if (decodedRaw) {
//         console.log('🧪 Token iat:', new Date(decodedRaw.iat * 1000).toLocaleString());
//         console.log('🧪 Token exp:', new Date(decodedRaw.exp * 1000).toLocaleString());
//       }

//       // ✅ Verify token
//       let decoded;
//       try {
//         decoded = jwt.verify(token, secret, { clockTolerance: 60 });
//         console.log('✅ JWT verified:', decoded);
//       } catch (err) {
//         console.error('❌ JWT verification failed:', err.message);
//         return res.status(401).json({ message: err.name === 'TokenExpiredError' ? 'Token expired' : 'Invalid token' });
//       }

//       // ✅ Redis session check
//       const userId = decoded._id || decoded.id;
//       const redisKey = `session:${userId}`;
//       const storedToken = await redis.get(redisKey);

//       console.log('🔍 Redis key:', redisKey);
//       console.log('🔍 Stored token exists:', !!storedToken);

//       if (!storedToken || storedToken !== token) {
//         console.warn('❌ Token mismatch or missing in Redis');
//         return res.status(401).json({ message: 'Session expired or invalid' });
//       }

//       // ✅ Fingerprint check (relaxed)
//       const userAgent = req.get('user-agent') || '';
//       const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.connection?.remoteAddress || '';
//       const currentFingerprint = sha256Hex(`${ip}|${userAgent}`);

//       if (decoded.fingerprint) {
//         const a = Buffer.from(decoded.fingerprint, 'utf8');
//         const b = Buffer.from(currentFingerprint, 'utf8');

//         const match =
//           a.length === b.length
//             ? crypto.timingSafeEqual(a, b)
//             : decoded.fingerprint === currentFingerprint;

//         if (!match) {
//           console.warn('⚠️ Fingerprint mismatch (not blocking)');
//           // return res.status(401).json({ message: 'Session fingerprint mismatch' });
//         }
//       } else {
//         console.warn('⚠️ Token missing fingerprint (not blocking)');
//         // return res.status(401).json({ message: 'Session fingerprint missing' });
//       }

//       // ✅ Attach user info
//       req.user = decoded;
//       req.userId = userId;
//       req.role = decoded.role || null;
//       req.adminId = userId;

//       // ✅ Role check
//       if (requiredRole) {
//         const tokenRole = (decoded.role || '').toLowerCase();
//         if (tokenRole !== requiredRole.toLowerCase()) {
//           console.warn(`🚫 Role mismatch: required=${requiredRole}, token=${tokenRole}`);
//           return res.status(403).json({ message: 'Insufficient permissions' });
//         }
//       }

//       return next();
//     } catch (err) {
//       console.error('❌ Auth middleware error:', err.message);
//       return res.status(500).json({ message: 'Server error during authentication' });
//     }
//   };
// };

'use strict';

const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const redis = require('../utils/redis');

const sessionCache = new Map(); // 🔁 In-memory fallback (per process)

function sha256Hex(input) {
  return crypto.createHash('sha256').update(String(input || '')).digest('hex');
}

module.exports = function (requiredRole = null) {
  return async (req, res, next) => {
    try {
      const authHeader = req.headers.authorization || req.headers.Authorization;
      let token =
        (authHeader && authHeader.startsWith('Bearer ') && authHeader.split(' ')[1]) ||
        req.cookies?.adminToken ||
        req.cookies?.userToken;

      if (!token) return res.status(401).json({ message: 'No token provided' });

      const secret = process.env.JWT_SECRET || process.env.ADMIN_JWT_SECRET;
      if (!secret) return res.status(500).json({ message: 'Server misconfiguration' });

      let decoded;
      try {
        decoded = jwt.verify(token, secret, { clockTolerance: 60 });
      } catch (err) {
        return res.status(401).json({ message: err.name === 'TokenExpiredError' ? 'Token expired' : 'Invalid token' });
      }

      const userId = decoded._id || decoded.id;
      const redisKey = `session:${userId}`;

      // ✅ Check in-memory cache first
      const cachedToken = sessionCache.get(redisKey);
      if (cachedToken === token) {
        // console.log('✅ Token matched from in-memory cache');
      } else {
        const storedToken = await redis.get(redisKey);
        if (!storedToken || storedToken !== token) {
          return res.status(401).json({ message: 'Session expired or invalid' });
        }
        sessionCache.set(redisKey, storedToken); // 🔁 Cache it for next time
      }

      // Optional: Fingerprint check (relaxed)
      const userAgent = req.get('user-agent') || '';
      const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.connection?.remoteAddress || '';
      const currentFingerprint = sha256Hex(`${ip}|${userAgent}`);

      if (decoded.fingerprint) {
        const a = Buffer.from(decoded.fingerprint, 'utf8');
        const b = Buffer.from(currentFingerprint, 'utf8');
        const match = a.length === b.length ? crypto.timingSafeEqual(a, b) : decoded.fingerprint === currentFingerprint;
        if (!match) {
          console.warn('⚠️ Fingerprint mismatch (not blocking)');
        }
      }

      req.user = decoded;
      req.userId = userId;
      req.role = decoded.role || null;
      req.adminId = userId;

      if (requiredRole) {
        const tokenRole = (decoded.role || '').toLowerCase();
        if (tokenRole !== requiredRole.toLowerCase()) {
          return res.status(403).json({ message: 'Insufficient permissions' });
        }
      }

      return next();
    } catch (err) {
      console.error('❌ Auth middleware error:', err.message);
      return res.status(500).json({ message: 'Server error during authentication' });
    }
  };
};
