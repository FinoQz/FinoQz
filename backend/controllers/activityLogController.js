const ActivityLog = require('../models/ActivityLog');

exports.getActivityLogs = async (req, res) => {
  try {
    const logs = await ActivityLog.find()
      .sort({ createdAt: -1 })
      .limit(200);

    res.json(logs);
  } catch (err) {
    console.error("Error fetching logs:", err);
    res.status(500).json({ message: "Failed to fetch logs" });
  }
};

exports.clearAllLogs = async (req, res) => {
  try {
    await ActivityLog.deleteMany({});
    res.json({ message: "All logs cleared successfully" });
  } catch (err) {
    console.error("Error clearing logs:", err);
    res.status(500).json({ message: "Failed to clear logs" });
  }
};


// exports.getLiveUsers = async (req, res) => {
//   try {
//     // ✅ Get count from Redis Set
//     const liveUserCount = await redis.scard('liveUsers');

//     // ✅ Push to sparkline list
//     await redis.lpush('liveUserSparkline', liveUserCount);
//     await redis.ltrim('liveUserSparkline', 0, 19); // Keep last 20 entries

//     // ✅ Fetch sparkline
//     const sparklineRaw = await redis.lrange('liveUserSparkline', 0, -1);
//     const sparkline = sparklineRaw.map(Number).reverse();

//     const data = {
//       type: 'liveUsers',
//       liveUsers: liveUserCount,
//       sparkline,
//     };

//     // ✅ Emit to admin-room
//     const io = req.app.get('io');
//     if (io) {
//       await emitLiveUserStats(io);
//     }

//     return res.json(data);
//   } catch (err) {
//     console.error('❌ Live user fetch error:', err);
//     return res.status(500).json({ message: 'Failed to fetch live users' });
//   }
// };






