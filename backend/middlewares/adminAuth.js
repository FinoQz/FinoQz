// middleware/adminAuth.js
const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  try {
    // Token nikalna (cookie ya header se)
    const token = req.cookies?.adminToken || req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ message: 'Unauthorized: No token provided' });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Check role
    if (!decoded || decoded.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden: Not an admin' });
    }

    // Attach adminId to request
    req.adminId = decoded.id;
    next();
  } catch (err) {
    console.error('❌ adminAuth error:', err.message);
    return res.status(401).json({ message: 'Unauthorized: Invalid token' });
  }
};
