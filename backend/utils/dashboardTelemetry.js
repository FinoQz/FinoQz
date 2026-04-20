import User from '../models/User.js';
import redis from './redis.js';

/**
 * Aggregates core dashboard metrics from the database.
 * This is the single source of truth for dashboard KPIs.
 */
export const buildDashboardStats = async () => {
  const [
    totalUsers,
    activeUsers,
    pendingApprovals,
    totalRevenueAgg,
    totalPaidUsers,
    freeQuizAttemptsAgg,
  ] = await Promise.all([
    User.countDocuments({}),
    User.countDocuments({ status: "approved" }),
    User.countDocuments({ status: "awaiting_admin_approval" }),
    User.aggregate([{ $group: { _id: null, total: { $sum: "$totalSpent" } } }]),
    User.countDocuments({ isPaidUser: true }),
    User.aggregate([{ $group: { _id: null, total: { $sum: "$freeQuizAttempts" } } }]),
  ]);

  return {
    totalUsers,
    activeUsers,
    pendingApprovals,
    totalRevenue: (Array.isArray(totalRevenueAgg) && totalRevenueAgg[0]?.total) || 0,
    totalPaidUsers,
    freeQuizAttempts: (Array.isArray(freeQuizAttemptsAgg) && freeQuizAttemptsAgg[0]?.total) || 0,
  };
};

/**
 * Triggers a real-time WebSocket update for the admin dashboard.
 * Uses caching to prevent database thrashing on high-frequency events.
 */
export const emitDashboardStats = async (req) => {
  try {
    const io = req.app.get("io");
    if (!io) {
      console.warn("⚠️ Socket.io instance not found in req.app");
      return;
    }

    // Try cache first (valid for 60s)
    const cached = await redis.get("dashboard:stats");
    if (cached) {
      const stats = JSON.parse(cached);
      io.to('admin-room').emit('dashboard:stats', stats);
      return;
    }

    // Fetch fresh stats
    const stats = await buildDashboardStats();
    await redis.set("dashboard:stats", JSON.stringify(stats), "EX", 60);

    // Emit to all admins
    io.to('admin-room').emit('dashboard:stats', stats);
    console.log("📡 Emitted fresh dashboard:stats via Telemetry Utility");
  } catch (err) {
    console.error("❌ emitDashboardStats Telemetry error:", err);
  }
};
