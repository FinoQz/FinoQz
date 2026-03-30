const User = require('../models/User');
const { emitDashboardStats } = require('./socket');

async function emitUsersUpdate(io) {
  const [pending, approved, rejected] = await Promise.all([
    User.find({ status: 'pending' }),
    User.find({ status: 'approved' }),
    User.find({ status: 'rejected' }),
  ]);

  io.to('admin-room').emit('users:update', {
    pending,
    approved,
    rejected,
  });

  emitDashboardStats({
    totalUsers: pending.length + approved.length + rejected.length,
    activeUsers: approved.length,
    pendingApprovals: pending.length,
  });
}

module.exports = emitUsersUpdate;
