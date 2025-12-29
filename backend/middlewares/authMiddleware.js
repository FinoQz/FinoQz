'use strict';

const jwt = require('jsonwebtoken');
const crypto = require('crypto');

function sha256Hex(input) {
  return crypto.createHash('sha256').update(String(input || '')).digest('hex');
}

module.exports = function (requiredRole = null) {
  return (req, res, next) => {
    try {
      const authHeader = req.headers.authorization || req.headers.Authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'No token provided' });
      }

      const token = authHeader.split(' ')[1];
      const secret = process.env.JWT_SECRET || process.env.ADMIN_JWT_SECRET;
      if (!secret) {
        console.error('JWT secret not configured (JWT_SECRET or ADMIN_JWT_SECRET)');
        return res.status(500).json({ message: 'Server misconfiguration' });
      }

      let decoded;
      try {
        decoded = jwt.verify(token, secret);
      } catch (err) {
        console.error('JWT verification failed:', err && err.message);
        if (err && err.name === 'TokenExpiredError') {
          return res.status(401).json({ message: 'Token expired' });
        }
        return res.status(401).json({ message: 'Invalid token' });
      }

      // Attach standard fields safely
      req.user = decoded;
      req.userId = decoded.id || decoded.userId || null;
      req.role = decoded.role || null;
      // keep adminId for backward compatibility if you need it
      if (!req.adminId && decoded.id) req.adminId = decoded.id;

      // Role check (if required)
      if (requiredRole) {
        const tokenRole = (decoded.role || '').toString().toLowerCase();
        if (!tokenRole || tokenRole !== requiredRole.toString().toLowerCase()) {
          return res.status(403).json({ message: 'Insufficient permissions' });
        }
      }

      // Fingerprint check (optional but recommended)
      // Current fingerprint: hash of ip + '|' + user-agent
      const userAgent = req.get('user-agent') || '';
      const ip = req.ip || req.connection?.remoteAddress || '';
      const currentFingerprintHex = sha256Hex(ip + '|' + userAgent);

      if (decoded.fingerprint) {
        try {
          const a = Buffer.from(String(decoded.fingerprint), 'utf8');
          const b = Buffer.from(currentFingerprintHex, 'utf8');
          // timingSafeEqual needs equal length buffers
          if (a.length === b.length) {
            if (!crypto.timingSafeEqual(a, b)) {
              return res.status(401).json({ message: 'Session invalid. Please login again.' });
            }
          } else {
            // If formats differ (e.g., token has raw fingerprint instead of hex), fall back to simple compare
            if (decoded.fingerprint !== currentFingerprintHex) {
              return res.status(401).json({ message: 'Session invalid. Please login again.' });
            }
          }
        } catch (err) {
          console.warn('Fingerprint compare error', err);
          return res.status(401).json({ message: 'Session invalid. Please login again.' });
        }
      } else {
        // Backwards compatibility: token has no fingerprint.
        // You may choose to reject such tokens instead of allowing them.
        console.warn('Token contains no fingerprint - consider reissuing tokens with fingerprint');
        // Optionally: return res.status(401).json({ message: 'Session invalid. Please login again.' });
      }

      return next();
    } catch (err) {
      console.error('auth middleware error', err && err.message);
      return res.status(500).json({ message: 'Server error' });
    }
  };
};