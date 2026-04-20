
import "dotenv/config";
import { Worker } from "bullmq";
import sendEmail from "../utils/sendEmail.js";
import ScheduledEmail from "../models/ScheduledEmail.js";
import adminBulkEmailTemplate from "../emailTemplates/adminBulkEmail.js";
import mongoose from "mongoose";
const isSecure = process.env.REDIS_URL?.startsWith("rediss://");

// Export the job handler as a named export
export async function handleEmailJob(job) {
  const { to, subject, html } = job.data;

  console.log(`📡 Worker processing [${job.name}] job for:`, to || 'multiple recipients');

  switch (job.name) {
    case "userEmailOtp":
    case "sendOtp":
    case "userLoginOtp":
    case "userForgotPasswordOtp":
    case "sendMail":
    case "userApproved":
    case "userRejected":
    case "userAwaitingApproval":
    case "adminApprovalRequest":
    case "newUserWelcome":
    case "contactUsQuery":
    case "newsletterWelcome":
    case "adminContactReply":
      if (!to) {
        console.log(`❌ No 'to' field in ${job.name} job`);
        return;
      }
      try {
        await sendEmail({ to, subject, html });
        console.log(`✅ [${job.name}] Email sent to ${to}`);
      } catch (err) {
        console.error(`❌ [${job.name}] Email failed to ${to}`, err);
        throw err;
      }
      break;

    case "loginAlert":
      try {
        if (Array.isArray(to)) {
          for (const email of to) {
            await sendEmail({ to: email, subject, html });
            console.log(`✅ Login alert sent to ${email}`);
          }
        } else {
          await sendEmail({ to, subject, html });
          console.log(`✅ Login alert sent to ${to}`);
        }
      } catch (err) {
        console.error(`❌ Login alert failed`, err);
        throw err;
      }
      break;

    case "bulkEmail":
      const { recipients, attachments } = job.data;
      if (!Array.isArray(recipients) || recipients.length === 0) {
        console.log("❌ No recipients found in bulkEmail job");
        return;
      }
      for (const email of recipients) {
        if (!email) continue;
        try {
          await sendEmail({ to: email, subject, html, attachments });
          console.log(`✅ Bulk email sent to ${email} with ${attachments?.length || 0} attachments`);
        } catch (err) {
          console.error(`❌ Bulk email failed to ${email}`, err);
        }
      }
      break;

    case "scheduledBulkEmail":
      const { scheduledEmailId } = job.data || {};
      let scheduledEmail = null;

      if (scheduledEmailId && mongoose.Types.ObjectId.isValid(String(scheduledEmailId))) {
        scheduledEmail = await ScheduledEmail.findById(String(scheduledEmailId));
      }

      if (!scheduledEmail && job?.id) {
        scheduledEmail = await ScheduledEmail.findOne({ jobId: String(job.id) });
      }

      if (!scheduledEmail && typeof job?.id === "string" && job.id.startsWith("scheduled-email-")) {
        const fallbackId = job.id.replace("scheduled-email-", "");
        if (mongoose.Types.ObjectId.isValid(fallbackId)) {
          scheduledEmail = await ScheduledEmail.findById(fallbackId);
        }
      }

      if (!scheduledEmail) {
        throw new Error(`Scheduled email not found for job ${job.id}`);
      }

      if (scheduledEmail.status !== "pending") {
        console.log(`ℹ️ Skipping scheduled email ${scheduledEmailId}; status=${scheduledEmail.status}`);
        return;
      }

      if (!Array.isArray(scheduledEmail.recipientEmails) || scheduledEmail.recipientEmails.length === 0) {
        scheduledEmail.status = "failed";
        scheduledEmail.errorMessage = "No recipients found for scheduled email";
        await scheduledEmail.save();
        throw new Error(`No recipients found for scheduled email ${scheduledEmail._id}`);
      }

      const bulkHtml = adminBulkEmailTemplate({ 
        message: scheduledEmail.body, 
        heroImage: scheduledEmail.heroImage, 
        ctaText: scheduledEmail.ctaText, 
        ctaUrl: scheduledEmail.ctaUrl 
      });

      const emailAttachments = (scheduledEmail.attachments || []).map(att => ({
        filename: att.filename,
        path: att.path,
        contentType: att.contentType
      }));

      try {
        for (const email of scheduledEmail.recipientEmails || []) {
          if (!email) continue;
          await sendEmail({
            to: email,
            subject: scheduledEmail.subject,
            html: bulkHtml,
            attachments: emailAttachments
          });
          console.log(`✅ Scheduled email sent to ${email} with ${emailAttachments.length} attachments`);
        }

        scheduledEmail.status = "sent";
        scheduledEmail.sentAt = new Date();
        scheduledEmail.errorMessage = null;
        await scheduledEmail.save();
      } catch (err) {
        scheduledEmail.status = "failed";
        scheduledEmail.errorMessage = err?.message || "Unknown send error";
        await scheduledEmail.save();
        console.error(`❌ Scheduled email failed: ${scheduledEmailId}`, err);
        throw err;
      }
      break;

    default:
      throw new Error(`Unhandled email job type: ${job.name}`);
  }
}

const emailWorker = new Worker(
  "emailQueue",
  handleEmailJob,
  {
    connection: {
      url: process.env.REDIS_URL,
      maxRetriesPerRequest: null,
      enableReadyCheck: false,
      ...(isSecure ? { tls: {} } : {}),
    },
    concurrency: 5,
  }
);



// ✅ Logs

emailWorker.on("completed", (job) =>
  console.log(`✅ [${job.name}] Job ${job.id} completed`)
);

emailWorker.on("failed", (job, err) =>
  console.error(`❌ [${job.name}] Job ${job.id} failed`, err)
);

export default emailWorker;
