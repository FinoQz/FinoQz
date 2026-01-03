module.exports = function requireAdmin(req, res, next) {
  const user = req.user;

  if (!user || typeof user.role !== 'string' || user.role.toLowerCase() !== 'admin') {
    console.warn('🚫 Access denied: Admin only');
    return res.status(403).json({ message: 'Forbidden: Admin access required' });
  }

  req.adminId = user.id || user._id;
  next();
};
