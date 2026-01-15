// utils/emitters.js
const redis = require('./redis');

async function emitLiveUserStats(io) {
  const liveUsers = await redis.scard('liveUsers');
  await redis.lpush('liveUserSparkline', liveUsers);
  await redis.ltrim('liveUserSparkline', 0, 19);

  const sparklineRaw = await redis.lrange('liveUserSparkline', 0, -1);
  const sparkline = sparklineRaw.map(Number).reverse();

  io.to('admin-room').emit('analytics:update', {
    type: 'liveUsers',
    liveUsers,
    sparkline,
  });

  console.log('📡 Emitted analytics:update', { type: 'liveUsers', liveUsers, sparkline });
}

async function emitDashboardStats(req) {
  console.log("📊 emitDashboardStats triggered");

  try {
    const io = req.app.get("io");
    if (!io) {
      console.warn("⚠️ Socket.io instance not found");
      return;
    }

    // 📦 Try dashboard stats from cache
    const [cachedStats, cachedGrowth] = await Promise.all([
      redis.get("dashboard:stats"),
      redis.get("dashboard:userGrowth"),
    ]);

    if (cachedStats) {
      const stats = JSON.parse(cachedStats);
      io.to('admin-room').emit('dashboard:stats', stats);
      console.log("📡 Emitted cached dashboard:stats", stats);
    }

    if (cachedGrowth) {
      const growth = JSON.parse(cachedGrowth);
      io.to('admin-room').emit('analytics:update', {
        type: 'userGrowth',
        labels: growth.labels,
        values: growth.values,
      });
      console.log("📡 Emitted cached userGrowth:", growth);
    }

    // 🔄 Fresh data fetch
    const [
      totalUsers,
      activeUsers,
      pendingApprovals,
      totalRevenueAgg,
      totalPaidUsers,
      freeQuizAttemptsAgg,
      userGrowthAgg,
    ] = await Promise.all([
      User.countDocuments({}),
      User.countDocuments({ status: "approved" }),
      User.countDocuments({ status: "awaiting_admin_approval" }),
      User.aggregate([{ $group: { _id: null, total: { $sum: "$totalSpent" } } }]),
      User.countDocuments({ isPaidUser: true }),
      User.aggregate([{ $group: { _id: null, total: { $sum: "$freeQuizAttempts" } } }]),
      User.aggregate([
        {
          $match: {
            createdAt: {
              $gte: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
            },
          },
        },
        {
          $group: {
            _id: {
              $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
            },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),
    ]);

    const stats = {
      totalUsers,
      activeUsers,
      pendingApprovals,
      totalRevenue: totalRevenueAgg?.[0]?.total || 0,
      totalPaidUsers,
      freeQuizAttempts: freeQuizAttemptsAgg?.[0]?.total || 0,
    };

    await redis.set("dashboard:stats", JSON.stringify(stats), "EX", 60);
    io.to('admin-room').emit('dashboard:stats', stats);
    console.log("📡 Emitted fresh dashboard:stats", stats);

    // 📊 Format user growth data
    const labels = [];
    const values = [];
    const dateMap = Object.fromEntries(userGrowthAgg.map(entry => [entry._id, entry.count]));

    for (let i = 7; i >= 0; i--) {
      const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
      const label = date.toISOString().split('T')[0];
      labels.push(label);
      values.push(dateMap[label] || 0);
    }

    const growthPayload = { labels, values };
    await redis.set("dashboard:userGrowth", JSON.stringify(growthPayload), "EX", 60);
    io.to('admin-room').emit('analytics:update', {
      type: 'userGrowth',
      labels,
      values,
    });
    console.log("📡 Emitted fresh userGrowth:", growthPayload);

  } catch (err) {
    console.error("❌ emitDashboardStats error:", err);
  }
}

async function emitAnalyticsUpdate(io, payload) {
  if (!io) {
    console.warn("⚠️ emitAnalyticsUpdate: Socket.io instance not found");
    return;
  }

  io.to('admin-room').emit('analytics:update', payload);
  console.log('📡 Emitted analytics:update', payload);
}




module.exports = {
  emitLiveUserStats,
  emitDashboardStats,
  emitAnalyticsUpdate
};
