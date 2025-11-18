const jwt = require('jsonwebtoken');

module.exports = (roles = []) => {
  // roles can be string or array, e.g. ['admin'] or ['user','admin']
  if (typeof roles === 'string') {
    roles = [roles];
  }

  return (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded; // { id, role }

      // ✅ Role check (optional)
      if (roles.length && !roles.includes(decoded.role)) {
        return res.status(403).json({ message: 'Forbidden: insufficient rights' });
      }

      next();
    } catch (err) {
      console.error('JWT verification failed:', err.message);
      return res.status(403).json({ message: 'Token invalid or expired' });
    }
  };
};

