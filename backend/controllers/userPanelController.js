const User = require('../models/User');

/**
 * User Panel Controller
 * - Protected route: requires JWT
 * - Returns user details for dashboard
 */
exports.getUserPanel = async (req, res) => {
  try {
    // JWT se decoded user id aata hai (authMiddleware set karega req.user)
    const user = await User.findById(req.user.id).select("fullName email role status");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.json({
      message: "Welcome to your dashboard!",
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        status: user.status
      }
    });
  } catch (err) {
    console.error("User panel error:", err);
    return res.status(500).json({ message: "Server error loading user panel" });
  }
};
