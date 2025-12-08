module.exports = function requireAdmin(req, res, next) {
  if (!req.user || req.user.role.toLowerCase() !== "admin") {
    return res.status(403).json({ message: "Forbidden: admin only" });
  }

  req.adminId = req.user.id;
  next();
};
