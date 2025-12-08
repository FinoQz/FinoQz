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
