// utils/emitters.js
import redis from './redis.js';
import User from '../models/User.js';
import { emitDashboardStats } from './dashboardTelemetry.js';

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


async function emitAnalyticsUpdate(io, payload) {
  if (!io) {
    console.warn("⚠️ emitAnalyticsUpdate: Socket.io instance not found");
    return;
  }

  io.to('admin-room').emit('analytics:update', payload);
  console.log('📡 Emitted analytics:update', payload);
}

async function emitUsersUpdate(req) {
  const io = req.app.get('io');
  if (!io) {
    console.warn("⚠️ emitUsersUpdate: Socket.io instance not found");
    return;
  }
  try {
    const users = await User.find({})
      .select('_id fullName email mobile status createdAt lastLoginAt')
      .sort({ createdAt: -1 });
    io.to('admin-room').emit('users:update', users);
    console.log('📡 Emitted users:update', users.length);
  } catch (err) {
    console.error('❌ emitUsersUpdate error:', err);
  }
}

export {
  emitLiveUserStats,
  emitDashboardStats,
  emitAnalyticsUpdate,
  emitUsersUpdate
};
