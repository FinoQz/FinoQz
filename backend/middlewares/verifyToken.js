
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

function sha256Hex(input) {
  return crypto.createHash("sha256").update(String(input || "")).digest("hex");
}

module.exports = (requiredRole = null) => {
  return (req, res, next) => {
    try {
      const token =
        req.cookies?.adminToken ||
        req.cookies?.userToken ||
        (req.headers.authorization?.startsWith("Bearer ")
          ? req.headers.authorization.split(" ")[1]
          : null);

      if (!token) {
        return res.status(401).json({ message: "No token provided" });
      }

      const secret = process.env.JWT_SECRET || process.env.ADMIN_JWT_SECRET;
      if (!secret) {
        console.error("❌ JWT secret not configured");
        return res.status(500).json({ message: "Server misconfiguration" });
      }

      const decoded = jwt.verify(token, secret);

      req.user = decoded;
      req.userId = decoded.id || decoded.userId || null;
      req.adminId = decoded.id;

      if (requiredRole && decoded.role?.toLowerCase() !== requiredRole.toLowerCase()) {
        return res.status(403).json({ message: "Forbidden: Admin access only" });
      }

      // ✅ Fingerprint check (relaxed)
      const userAgent = req.get("user-agent") || "";
      const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.connection?.remoteAddress || '';
      const currentFingerprint = sha256Hex(`${ip}|${userAgent}`);

      if (decoded.fingerprint && decoded.fingerprint !== currentFingerprint) {
        console.warn("⚠️ Fingerprint mismatch (not blocking)");
        // return res.status(401).json({ message: "Session invalid. Please login again." });
      }

      return next();
    } catch (err) {
      console.error("❌ JWT verification failed:", err.message);
      return res.status(401).json({ message: "Invalid or expired token" });
    }
  };
};
