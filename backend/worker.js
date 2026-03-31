import 'dotenv/config';
import { connectDB } from './config/db.js';
import './utils/emailWorker.js';
import ScheduledEmail from './models/ScheduledEmail.js';
import emailQueue from './utils/emailQueue.js';

process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err);
});

process.on('unhandledRejection', (reason) => {
  console.error('❌ Unhandled Rejection:', reason);
});

const startWorker = async () => {
  try {
    await connectDB();

    const pendingEmails = await ScheduledEmail.find({ status: 'pending' });
    for (const item of pendingEmails) {
      const existingJob = item.jobId ? await emailQueue.getJob(item.jobId) : null;
      if (existingJob) {
        continue;
      }

      const delayMs = Math.max(0, new Date(item.scheduledFor).getTime() - Date.now());
      const recoveredJob = await emailQueue.add(
        'scheduledBulkEmail',
        { scheduledEmailId: String(item._id) },
        {
          delay: delayMs,
          jobId: `scheduled-email-${item._id}`,
        }
      );

      item.jobId = String(recoveredJob.id);
      await item.save();
    }

    console.log('✅ Email worker started (BullMQ + MongoDB connected)');
  } catch (err) {
    console.error('❌ Worker startup failed:', err);
    process.exit(1);
  }
};

startWorker();
