// require("dotenv").config();
// require("./utils/emailWorker");

// console.log("✅ Email worker started...");
// require("dotenv").config();
// const Redis = require("ioredis");

// // Optional: email queue handler
// const { handleEmailJob } = require("./utils/emailWorker");

// process.on("uncaughtException", (err) => {
//   console.error("❌ Uncaught Exception:", err);
// });

// process.on("unhandledRejection", (reason) => {
//   console.error("❌ Unhandled Rejection:", reason);
// });

// async function connectRedisWithRetry(retries = 5, delay = 2000) {
//   for (let i = 0; i < retries; i++) {
//     try {
//       const redis = new Redis(process.env.REDIS_URL, { tls: {} });
//       await redis.ping();
//       console.log("✅ Redis connected");
//       return redis;
//     } catch (err) {
//       console.error(`❌ Redis connection failed (attempt ${i + 1}):`, err.message);
//       await new Promise((res) => setTimeout(res, delay));
//     }
//   }

//   console.error("🚨 Redis connection failed after multiple attempts. Running in degraded mode.");
//   return null;
// }

// async function startWorker() {
//   const redis = await connectRedisWithRetry();

//   console.log("✅ Email worker started...");

//   if (!redis) {
//     console.warn("⚠️ Redis unavailable — worker running without queue");
//     return;
//   }

//   try {
//     // Example: subscribe to email queue
//     redis.subscribe("email:queue", (err, count) => {
//       if (err) {
//         console.error("❌ Redis subscribe error:", err.message);
//       } else {
//         console.log(`📡 Subscribed to ${count} channel(s)`);
//       }
//     });

//     redis.on("message", async (channel, message) => {
//       console.log(`📨 New message on ${channel}:`, message);
//       try {
//         await handleEmailJob(JSON.parse(message));
//       } catch (err) {
//         console.error("❌ Failed to process email job:", err.message);
//       }
//     });
//   } catch (err) {
//     console.error("❌ Worker runtime error:", err);
//   }
// }

// startWorker();
import dotenv from 'dotenv';
dotenv.config();
import Redis from 'ioredis';
import { handleEmailJob } from './utils/emailWorker.js';

process.on("uncaughtException", (err) => {
  console.error("❌ Uncaught Exception:", err);
});

process.on("unhandledRejection", (reason) => {
  console.error("❌ Unhandled Rejection:", reason);
});

function createRedisClient() {
  const isSecure = process.env.REDIS_URL?.startsWith("rediss://");
  return new Redis(process.env.REDIS_URL, {
    ...(isSecure ? { tls: {} } : {}), // ✅ TLS only if rediss://
    connectTimeout: 10000,
    maxRetriesPerRequest: null,
    enableReadyCheck: true,
    retryStrategy(times) {
      const delay = Math.min(times * 200, 2000);
      console.log(`🔁 Redis retrying in ${delay}ms (attempt: ${times})`);
      return delay;
    },
  });
}

async function connectRedisWithRetry(retries = 5, delay = 2000) {
  for (let i = 0; i < retries; i++) {
    try {
      const redis = createRedisClient();
      await redis.ping();
      console.log("✅ Redis connected");
      return redis;
    } catch (err) {
      console.error(`❌ Redis connection failed (attempt ${i + 1}):`, err.message);
      await new Promise((res) => setTimeout(res, delay));
    }
  }

  console.error("🚨 Redis connection failed after multiple attempts. Running in degraded mode.");
  return null;
}

async function startWorker() {
  const redis = await connectRedisWithRetry();

  console.log("✅ Email worker started...");

  if (!redis) {
    console.warn("⚠️ Redis unavailable — worker running without queue");
    return;
  }

  try {
    redis.subscribe("email:queue", (err, count) => {
      if (err) {
        console.error("❌ Redis subscribe error:", err.message);
      } else {
        console.log(`📡 Subscribed to ${count} channel(s)`);
      }
    });

    redis.on("message", async (channel, message) => {
      console.log(`📨 New message on ${channel}:`, message);
      try {
        await handleEmailJob(JSON.parse(message));
      } catch (err) {
        console.error("❌ Failed to process email job:", err.message);
      }
    });
  } catch (err) {
    console.error("❌ Worker runtime error:", err);
  }
}

startWorker();
