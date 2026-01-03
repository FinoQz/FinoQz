// middleware/adminAuth.js
const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  try {
    const token =
      req.cookies?.adminToken ||
      req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ message: 'Unauthorized: No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded || decoded.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden: Not an admin' });
    }

    req.adminId = decoded._id;
    req.admin = decoded;
    next();
  } catch (err) {
    console.error('❌ adminAuth error:', err.message);
    return res.status(401).json({ message: 'Unauthorized: Invalid token' });
  }
};
