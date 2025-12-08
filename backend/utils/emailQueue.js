// utils/emailQueue.js
const { Queue } = require('bullmq');

const emailQueue = new Queue('emailQueue', {
  connection: {
    url: process.env.REDIS_URL, // ✅ Upstash TLS URL
    tls: {},                    // ✅ Required for Upstash
  },
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: 'exponential', delay: 5000 },
    removeOnComplete: true,
    removeOnFail: false,
  },
});

module.exports = emailQueue;
// const { Queue } = require('bullmq');

// const connection = {
//   url: process.env.REDIS_URL, // ✅ Upstash TLS URL
//   tls: {},                    // ✅ Required for Upstash
// };

// const emailQueue = new Queue('emailQueue', {
//   connection,
//   defaultJobOptions: {
//     attempts: 3, // ✅ retry up to 3 times
//     backoff: { type: 'exponential', delay: 5000 }, // ✅ exponential backoff
//     removeOnComplete: true, // ✅ auto-clean successful jobs
//     removeOnFail: false,    // ❌ keep failed jobs for inspection
//   },
// });

// module.exports = emailQueue;
