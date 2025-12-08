// utils/redis.js
const Redis = require('ioredis');

if (!process.env.REDIS_URL) {
  console.warn('⚠️ REDIS_URL not set. Redis features will not work.');
}

const redis = new Redis(process.env.REDIS_URL, {
  // tls: {}, // Upstash requires TLS
  connectTimeout: 10000,
  maxRetriesPerRequest: null,
  enableReadyCheck: true,
  retryStrategy(times) {
    const delay = Math.min(times * 200, 2000);
    console.log(`🔁 Redis retrying in ${delay}ms (attempt: ${times})`);
    return delay;
  },
});

redis.on('connect', () => console.log('✅ Redis connected'));
redis.on('ready', () => console.log('🚀 Redis ready'));
redis.on('error', (err) => console.error('❌ Redis error', err.message));
redis.on('end', () => console.log('⚠️ Redis connection closed'));

process.on('SIGINT', async () => {
  try {
    await redis.quit();
    console.log('👋 Redis connection closed gracefully');
    process.exit(0);
  } catch (err) {
    console.error('Error closing Redis:', err);
    process.exit(1);
  }
});

module.exports = redis;
// const Redis = require('ioredis');
// const logger = require('./logger'); // ✅ structured logger

// if (!process.env.REDIS_URL) {
//   logger.warn('⚠️ REDIS_URL not set. Redis features disabled.');
// }

// const redis = new Redis(process.env.REDIS_URL, {
//   connectTimeout: parseInt(process.env.REDIS_CONNECT_TIMEOUT, 10) || 10000,
//   maxRetriesPerRequest: null,
//   enableReadyCheck: true,
//   tls: process.env.REDIS_TLS === 'true' ? {} : undefined,
//   retryStrategy(times) {
//     const delay = Math.min(times * 200, 2000);
//     logger.warn(`🔁 Redis retrying in ${delay}ms (attempt: ${times})`);
//     return delay;
//   },
// });

// // Event listeners
// redis.on('connect', () => logger.info('✅ Redis connected'));
// redis.on('ready', () => logger.info('🚀 Redis ready'));
// redis.on('error', (err) => logger.error('❌ Redis error', { error: err.message }));
// redis.on('end', () => logger.warn('⚠️ Redis connection closed'));

// // Graceful shutdown
// ['SIGINT', 'SIGTERM'].forEach(signal => {
//   process.on(signal, async () => {
//     try {
//       await redis.quit();
//       logger.info(`👋 Redis connection closed gracefully on ${signal}`);
//       process.exit(0);
//     } catch (err) {
//       logger.error('Error closing Redis', { error: err.message });
//       process.exit(1);
//     }
//   });
// });

// // Health check
// const redisHealth = () => ({
//   status: redis.status,
//   isReady: redis.status === 'ready'
// });

// module.exports = { redis, redisHealth };
