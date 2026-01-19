// // // utils/redis.js
// // const Redis = require('ioredis');

// // if (!process.env.REDIS_URL) {
// //   console.warn('⚠️ REDIS_URL not set. Redis features will not work.');
// // }

// // const redis = new Redis(process.env.REDIS_URL, {
// //   // tls: {}, // Upstash requires TLS
// //   connectTimeout: 10000,
// //   maxRetriesPerRequest: null,
// //   enableReadyCheck: true,
// //   retryStrategy(times) {
// //     const delay = Math.min(times * 200, 2000);
// //     console.log(`🔁 Redis retrying in ${delay}ms (attempt: ${times})`);
// //     return delay;
// //   },
// // });

// // redis.on('connect', () => console.log('✅ Redis connected'));
// // redis.on('ready', () => console.log('🚀 Redis ready'));
// // redis.on('error', (err) => console.error('❌ Redis error', err.message));
// // redis.on('end', () => console.log('⚠️ Redis connection closed'));

// // process.on('SIGINT', async () => {
// //   try {
// //     await redis.quit();
// //     console.log('👋 Redis connection closed gracefully');
// //     process.exit(0);
// //   } catch (err) {
// //     console.error('Error closing Redis:', err);
// //     process.exit(1);
// //   }
// // });

// // module.exports = redis;
// const Redis = require('ioredis');

// if (!process.env.REDIS_URL) {
//   console.warn('⚠️ REDIS_URL not set. Redis features will not work.');
// }

// const redis = new Redis(process.env.REDIS_URL, {
//   tls: {}, 
//   connectTimeout: 10000,
//   maxRetriesPerRequest: null,
//   enableReadyCheck: true,
//   retryStrategy(times) {
//     const delay = Math.min(times * 200, 2000);
//     console.log(`🔁 Redis retrying in ${delay}ms (attempt: ${times})`);
//     return delay;
//   },
// });

// // ✅ Handle Redis lifecycle events
// redis.on('connect', () => console.log('✅ Redis connected'));
// redis.on('ready', () => console.log('🚀 Redis ready'));
// redis.on('error', (err) => console.error('❌ Redis error:', err.message));
// redis.on('end', () => console.log('⚠️ Redis connection closed'));
// redis.on('reconnecting', () => console.log('🔁 Redis reconnecting...'));

// // ✅ Graceful shutdown on Ctrl+C or process kill
// process.on('SIGINT', async () => {
//   try {
//     await redis.quit();
//     console.log('👋 Redis connection closed gracefully');
//     process.exit(0);
//   } catch (err) {
//     console.error('❌ Error closing Redis:', err.message);
//     process.exit(1);
//   }
// });

// module.exports = redis;
const Redis = require('ioredis');

if (!process.env.REDIS_URL) {
  console.warn('⚠️ REDIS_URL not set. Redis features will not work.');
}

const isSecure = process.env.REDIS_URL.startsWith('rediss://');

const redis = new Redis(process.env.REDIS_URL, {
  ...(isSecure ? { tls: {} } : {}), // ✅ only add TLS if rediss://
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
redis.on('error', (err) => console.error('❌ Redis error:', err.message));
redis.on('end', () => console.log('⚠️ Redis connection closed'));
redis.on('reconnecting', () => console.log('🔁 Redis reconnecting...'));

process.on('SIGINT', async () => {
  try {
    await redis.quit();
    console.log('👋 Redis connection closed gracefully');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error closing Redis:', err.message);
    process.exit(1);
  }
});

module.exports = redis;
