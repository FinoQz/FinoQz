// utils/emailQueue.js

const { Queue } = require('bullmq');

const isSecure = process.env.REDIS_URL?.startsWith('rediss://');

const emailQueue = new Queue('emailQueue', {
  connection: {
    url: process.env.REDIS_URL,
    ...(isSecure ? { tls: {} } : {}), // ✅ only add TLS if using rediss://
  },
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: 'exponential', delay: 5000 },
    removeOnComplete: true,
    removeOnFail: false,
  },
});

module.exports = emailQueue;
