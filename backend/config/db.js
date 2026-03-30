
import mongoose from 'mongoose';
import winston from 'winston';

// --- Structured Logger ---
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    })
    // Add file or cloud transports here if needed
  ],
});

// --- Configurable Options via ENV ---
const options = {
  serverSelectionTimeoutMS: parseInt(process.env.DB_SERVER_TIMEOUT) || 10000,
  socketTimeoutMS: parseInt(process.env.DB_SOCKET_TIMEOUT) || 45000,
  maxPoolSize: parseInt(process.env.DB_MAX_POOL) || 50,
  minPoolSize: parseInt(process.env.DB_MIN_POOL) || 5,
  autoIndex: process.env.DB_AUTO_INDEX === 'true',
  ssl: process.env.DB_SSL === 'true',
  replicaSet: process.env.DB_REPLICA_SET || undefined,
};

// --- Retry Logic with Exponential Backoff ---
const connectDB = async (retries = 5, delay = 2000) => {
  try {
    await mongoose.connect(process.env.MONGO_URI, options);
    logger.info('✅ Connected to MongoDB');
  } catch (err) {
    if (retries === 0) {
      logger.error('❌ DB connection failed permanently', { error: err.message });
      process.exit(1);
    }
    logger.warn(`⚠️ Retry in ${delay}ms... (${retries} left)`);
    setTimeout(() => connectDB(retries - 1, delay * 2), delay);
  }
};

// --- Event Listeners ---
mongoose.connection.on('connected', () => {
  logger.info('✅ Mongoose connected');
});

mongoose.connection.on('error', (err) => {
  logger.error('❌ Mongoose error', { error: err.message });
});

mongoose.connection.on('disconnected', () => {
  logger.warn('⚠️ Mongoose disconnected');
});

// --- Graceful Shutdown ---
process.on('SIGINT', async () => {
  await mongoose.connection.close();
  logger.info('🔌 Mongoose connection closed');
  process.exit(0);
});

// --- Health Check Utility ---
const dbHealth = () => {
  const state = mongoose.connection.readyState;
  // 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
  return {
    status: state === 1 ? 'UP' : 'DOWN',
    state,
  };
};

export { connectDB, dbHealth, logger };
