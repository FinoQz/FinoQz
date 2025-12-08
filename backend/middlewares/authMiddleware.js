const jwt = require("jsonwebtoken");

module.exports = (requiredRole = null) => {
  return (req, res, next) => {
    try {
      const authHeader = req.headers.authorization;

      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "No token provided" });
      }

      const token = authHeader.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // ✅ Attach user info
      req.user = decoded;
      req.userId = decoded.id;   // <-- ADD THIS LINE
      req.adminId = decoded.id;

      // ✅ Strict role check
      if (requiredRole && decoded.role.toLowerCase() !== requiredRole.toLowerCase()) {
        return res.status(403).json({ message: "Admin access only" });
      }

      // ✅ Device/IP fingerprint check (prevents token reuse)
      const currentFingerprint = req.ip + req.headers["user-agent"];
      if (decoded.fingerprint !== currentFingerprint) {
        return res.status(401).json({ message: "Session invalid. Please login again." });
      }

      next();
    } catch (err) {
  console.error("JWT verification failed:", err.message);
  if (err.name === "TokenExpiredError") {
    return res.status(401).json({ message: "Token expired" });
  }
  return res.status(401).json({ message: "Invalid token" });
}

  };
};
