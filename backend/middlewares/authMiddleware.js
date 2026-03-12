import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import redis from '../utils/redis.js';

const sessionCache = new Map(); // 🔁 In-memory fallback (per process)

function sha256Hex(input) {
  return crypto.createHash('sha256').update(String(input || '')).digest('hex');
}

const authMiddleware = function (requiredRole = null) {
  return async (req, res, next) => {
    try {
      const authHeader = req.headers.authorization || req.headers.Authorization;
      let token =
        (authHeader && authHeader.startsWith('Bearer ') && authHeader.split(' ')[1]) ||
        null;

      if (!token) {
        const wantsAdmin = requiredRole && requiredRole.toLowerCase() === 'admin';
        token = wantsAdmin
          ? (req.cookies?.adminToken || req.cookies?.userToken)
          : (req.cookies?.userToken || req.cookies?.adminToken);
      }

      if (!token) return res.status(401).json({ message: 'No token provided' });

      const secret = process.env.JWT_SECRET || process.env.ADMIN_JWT_SECRET;
      if (!secret) return res.status(500).json({ message: 'Server misconfiguration' });

      let decoded;
      try {
        decoded = jwt.verify(token, secret, { clockTolerance: 60 });
      } catch (err) {
        return res.status(401).json({ message: err.name === 'TokenExpiredError' ? 'Token expired' : 'Invalid token' });
      }

      const userId = decoded._id || decoded.id || decoded.userId;
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

export default authMiddleware;
