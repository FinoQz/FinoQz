
import "dotenv/config";
import { Worker } from "bullmq";
import sendEmail from "../utils/sendEmail.js";
import ScheduledEmail from "../models/ScheduledEmail.js";
import adminBulkEmailTemplate from "../emailTemplates/adminBulkEmail.js";
import mongoose from "mongoose";
const isSecure = process.env.REDIS_URL?.startsWith("rediss://");

// Export the job handler as a named export
export async function handleEmailJob(job) {

    // ✅ 1. User Signup Email OTP
    if (job.name === "userEmailOtp") {
      const { to, subject, html } = job.data;

      console.log("✅ Worker received USER EMAIL OTP job for:", to);

      if (!to) return console.log("❌ No 'to' field in userEmailOtp job");

      try {
        await sendEmail({ to, subject, html });
        console.log(`✅ User Email OTP sent to ${to}`);
      } catch (err) {
        console.error(`❌ User Email OTP failed to ${to}`, err);
        throw err;
      }
      return;
    }

    // ✅ 2. Admin Login OTP
    if (job.name === "sendOtp") {
      const { to, subject, html } = job.data;

      console.log("✅ Worker received ADMIN OTP job for:", to);

      if (!to) return console.log("❌ No 'to' field in sendOtp job");

      try {
        await sendEmail({ to, subject, html });
        console.log(`✅ Admin OTP sent to ${to}`);
      } catch (err) {
        console.error(`❌ Admin OTP failed to ${to}`, err);
        throw err;
      }
      return;
    }

    // ✅ 3. Login Alert Email
    if (job.name === "loginAlert") {
      const { to, subject, html } = job.data;

      console.log("✅ Worker received LOGIN ALERT job for:", to);

      if (!to) return console.log("❌ No 'to' field in loginAlert job");

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
      return;
    }

    // ✅ 4. Bulk Email
    if (job.name === "bulkEmail") {
      const { recipients, subject, html } = job.data;

      console.log("✅ Worker received BULK EMAIL job");

      if (!Array.isArray(recipients) || recipients.length === 0)
        return console.log("❌ No recipients found in bulkEmail job");

      for (const email of recipients) {
        if (!email) continue;
        try {
          await sendEmail({ to: email, subject, html });
          console.log(`✅ Bulk email sent to ${email}`);
        } catch (err) {
          console.error(`❌ Bulk email failed to ${email}`, err);
        }
      }
      return;
    }

    // ✅ 5. Generic Single Email
    if (job.name === "sendMail") {
      const { to, subject, html } = job.data;

      if (!to) return console.log("❌ No 'to' field in sendMail job");

      try {
        await sendEmail({ to, subject, html });
        console.log(`✅ Single email sent to ${to}`);
      } catch (err) {
        console.error(`❌ Single email failed to ${to}`, err);
        throw err;
      }
      return;
    }

    // ✅ Scheduled bulk email (delayed job)
    if (job.name === "scheduledBulkEmail") {
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
        throw new Error(`Scheduled email not found for job ${job.id} (scheduledEmailId=${scheduledEmailId || "N/A"})`);
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

      const html = adminBulkEmailTemplate(scheduledEmail.body);

      try {
        for (const email of scheduledEmail.recipientEmails || []) {
          if (!email) continue;
          await sendEmail({
            to: email,
            subject: scheduledEmail.subject,
            html,
          });
          console.log(`✅ Scheduled email sent to ${email}`);
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

      return;
    }

    // ✅ User Approved Email
    if (job.name === "userApproved") {
      const { to, subject, html } = job.data;

      console.log("✅ Worker received USER APPROVED email job for:", to);

      if (!html) {
        console.log("❌ userApproved job missing HTML");
        return;
      }

      try {
        await sendEmail({ to, subject, html });
        console.log(`✅ Approval email sent to ${to}`);
      } catch (err) {
        console.error(`❌ Approval email failed to ${to}`, err);
        throw err;
      }
      return;
    }

    // ✅ User Rejected Email
    if (job.name === "userRejected") {
      const { to, subject, html } = job.data;

      console.log("✅ Worker received USER REJECTED email job for:", to);

      if (!html) {
        console.log("❌ userRejected job missing HTML");
        return;
      }

      try {
        await sendEmail({ to, subject, html });
        console.log(`✅ Rejection email sent to ${to}`);
      } catch (err) {
        console.error(`❌ Rejection email failed to ${to}`, err);
        throw err;
      }
      return;
    }

    // ✅ User Awaiting Approval Email
    if (job.name === "userAwaitingApproval") {
      const { to, subject, html } = job.data;

      console.log("✅ Worker received USER AWAITING APPROVAL job for:", to);

      if (!html) return console.log("❌ userAwaitingApproval job missing HTML");

      try {
        await sendEmail({ to, subject, html });
        console.log(`✅ Awaiting approval email sent to ${to}`);
      } catch (err) {
        console.error(`❌ Awaiting approval email failed to ${to}`, err);
        throw err;
      }
      return;
    }

    // ✅ Admin Approval Request Email
    if (job.name === "adminApprovalRequest") {
      const { to, subject, html } = job.data;

      console.log("✅ Worker received ADMIN APPROVAL REQUEST job for:", to);

      if (!html) return console.log("❌ adminApprovalRequest job missing HTML");

      try {
        await sendEmail({ to, subject, html });
        console.log(`✅ Admin approval request email sent to ${to}`);
      } catch (err) {
        console.error(`❌ Admin approval request email failed to ${to}`, err);
        throw err;
      }
      return;
    }

    // ✅ User Login OTP
    if (job.name === "userLoginOtp") {
      const { to, subject, html } = job.data;

      console.log("✅ Worker received USER LOGIN OTP job for:", to);

      if (!to) return console.log("❌ No 'to' field in userLoginOtp job");

      try {
        await sendEmail({ to, subject, html });
        console.log(`✅ User Login OTP sent to ${to}`);
      } catch (err) {
        console.error(`❌ User Login OTP failed to ${to}`, err);
        throw err;
      }
      return;
    }

    // ✅ Forgot Password OTP Email
    if (job.name === "userForgotPasswordOtp") {
      const { to, subject, html } = job.data;

      console.log("✅ Worker received FORGOT PASSWORD OTP job for:", to);

      if (!to) return console.log("❌ No 'to' field in userForgotPasswordOtp job");

      try {
        await sendEmail({ to, subject, html });
        console.log(`✅ Forgot Password OTP sent to ${to}`);
      } catch (err) {
        console.error(`❌ Forgot Password OTP failed to ${to}`, err);
        throw err;
      }
      return;
    }

    // ✅ New User Welcome Email
    if (job.name === "newUserWelcome") {
      const { to, subject, html } = job.data;

      console.log("✅ Worker received NEW USER WELCOME job for:", to);

      if (!to) return console.log("❌ newUserWelcome job missing 'to' field");
      if (!subject || !html) return console.log("❌ newUserWelcome job missing subject or HTML");

      try {
        await sendEmail({ to, subject, html });
        console.log(`✅ New User Welcome email sent to ${to}`);
      } catch (err) {
        console.error(`❌ New User Welcome email failed to ${to}`, err);
        throw err;
      }
      return;
    }

    throw new Error(`Unhandled email job type: ${job.name}`);



}

const emailWorker = new Worker(
  "emailQueue",
  handleEmailJob,
  {
    connection: {
      url: process.env.REDIS_URL,
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
