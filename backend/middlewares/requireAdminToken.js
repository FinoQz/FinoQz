const jwt = require("jsonwebtoken");

function requireAdminToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  if (!authHeader) {
    return res.status(401).json({ message: "No token provided" });
  }

  const token = authHeader.split(" ")[1]; // "Bearer <token>"
  if (!token) {
    return res.status(401).json({ message: "Invalid token format" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // check role
    if (decoded.role !== "admin") {
      return res.status(403).json({ message: "Forbidden: Admins only" });
    }

    // attach adminId to request for controllers
    req.adminId = decoded.id;
    next();
  } catch (err) {
    console.error("❌ JWT verify error:", err.message);
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}

module.exports = requireAdminToken;
