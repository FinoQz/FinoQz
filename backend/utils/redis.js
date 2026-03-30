import Redis from 'ioredis';

// Check if Redis URL is set

let redisClient;
if (!process.env.REDIS_URL) {
  console.warn('⚠️ REDIS_URL not set. Using mock Redis client.');
  // Create a mock Redis client that doesn't fail but doesn't do anything
  redisClient = {
    get: async () => null,
    set: async () => 'OK',
    setex: async () => 'OK',
    del: async () => 1,
    sadd: async () => 1,
    srem: async () => 1,
    smembers: async () => [],
    scard: async () => 0,
    on: () => {},
    quit: async () => 'OK'
  };
} else {
  const isSecure = process.env.REDIS_URL.startsWith('rediss://');
  redisClient = new Redis(process.env.REDIS_URL, {
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
  redisClient.on('connect', () => console.log('✅ Redis connected'));
  redisClient.on('ready', () => console.log('🚀 Redis ready'));
  redisClient.on('error', (err) => console.error('❌ Redis error:', err.message));
  redisClient.on('end', () => console.log('⚠️ Redis connection closed'));
  redisClient.on('reconnecting', () => console.log('🔁 Redis reconnecting...'));
  process.on('SIGINT', async () => {
    try {
      await redisClient.quit();
      console.log('👋 Redis connection closed gracefully');
      process.exit(0);
    } catch (err) {
      console.error('❌ Error closing Redis:', err.message);
      process.exit(1);
    }
  });
}

export default redisClient;
