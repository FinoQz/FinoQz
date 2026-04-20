import { Queue } from 'bullmq';

const isSecure = process.env.REDIS_URL?.startsWith('rediss://');

const emailQueue = new Queue('emailQueue', {
  connection: {
    url: process.env.REDIS_URL,
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
    ...(isSecure ? { tls: {} } : {}),
  },
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: 'exponential', delay: 5000 },
    removeOnComplete: true,
    removeOnFail: false,
  },
});

export default emailQueue;
