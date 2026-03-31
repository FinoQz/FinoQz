import mongoose from 'mongoose';

const scheduledEmailSchema = new mongoose.Schema(
  {
    subject: {
      type: String,
      required: true,
      trim: true,
    },
    body: {
      type: String,
      required: true,
    },
    recipients: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    recipientEmails: [
      {
        type: String,
        lowercase: true,
        trim: true,
      },
    ],
    scheduledFor: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'sent', 'failed', 'cancelled'],
      default: 'pending',
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin',
      required: true,
    },
    sentAt: {
      type: Date,
      default: null,
    },
    errorMessage: {
      type: String,
      default: null,
    },
    jobId: {
      type: String,
      default: null, // Store BullMQ job ID for tracking
    },
  },
  { timestamps: true }
);

// Index for filtering pending emails
scheduledEmailSchema.index({ status: 1, scheduledFor: 1 });
scheduledEmailSchema.index({ createdBy: 1, createdAt: -1 });

export default mongoose.model('ScheduledEmail', scheduledEmailSchema);
