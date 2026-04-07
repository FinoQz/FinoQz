import User from '../models/User.js';
import Group from '../models/Group.js';
import emailQueue from '../utils/emailQueue.js';
import newQuizNotificationTemplate from '../emailTemplates/newQuizNotification.js';
import mongoose from 'mongoose';

/**
 * Resolves all eligible recipients for a quiz based on its visibility and assignments.
 */
const resolveRecipients = async (quiz) => {
  const { visibility, assignedGroups, assignedIndividuals } = quiz;

  if (visibility === 'public') {
    // Fetch all active/approved users
    return await User.find({ 
      status: { $in: ['approved', 'active', 'Active'] } 
    }).select('email fullName').lean();
  }

  const recipientMap = new Map();

  // 1. Resolve Individuals
  if (Array.isArray(assignedIndividuals) && assignedIndividuals.length > 0) {
    const ids = assignedIndividuals.filter(id => mongoose.Types.ObjectId.isValid(id));
    const emails = assignedIndividuals.filter(email => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email));

    const users = await User.find({
      $or: [
        { _id: { $in: ids } },
        { email: { $in: emails.map(e => e.toLowerCase()) } }
      ]
    }).select('email fullName').lean();

    users.forEach(u => recipientMap.set(u.email.toLowerCase(), u));
    
    // Handing emails that don't have a user record yet
    emails.forEach(email => {
      const lowEmail = email.toLowerCase();
      if (!recipientMap.has(lowEmail)) {
        recipientMap.set(lowEmail, { email: lowEmail, fullName: email.split('@')[0] });
      }
    });
  }

  // 2. Resolve Groups
  if (visibility === 'private' && Array.isArray(assignedGroups) && assignedGroups.length > 0) {
    const groups = await Group.find({
      $or: [
        { _id: { $in: assignedGroups.filter(id => mongoose.Types.ObjectId.isValid(id)) } },
        { name: { $in: assignedGroups } }
      ]
    }).populate('members', 'email fullName').lean();

    groups.forEach(group => {
      if (group.members) {
        group.members.forEach(m => recipientMap.set(m.email.toLowerCase(), m));
      }
    });
  }

  return Array.from(recipientMap.values());
};

/**
 * Queues email notifications for a quiz launch.
 */
export const notifyQuizLaunch = async (quiz, categoryName = 'General') => {
  if (!quiz.broadcastEmail || quiz.status !== 'published') {
    return { success: false, reason: 'Broadcast disabled or quiz not published' };
  }

  try {
    const recipients = await resolveRecipients(quiz);
    if (recipients.length === 0) return { success: false, reason: 'No recipients found' };

    const now = Date.now();
    const startAt = new Date(quiz.startAt).getTime();
    const delay = Math.max(0, startAt - now);

    const actionUrl = `${process.env.FRONTEND_URL || 'https://finoqz.com'}/user_dash/dashboard`;

    const jobs = recipients.map(user => {
      const html = newQuizNotificationTemplate({
        fullName: user.fullName || 'Learner',
        quizTitle: quiz.quizTitle,
        quizDescription: quiz.description,
        categoryName,
        duration: quiz.duration,
        startAt: quiz.startAt,
        actionUrl
      });

      return {
        name: 'sendMail',
        data: {
          to: user.email,
          subject: `🚀 New Quiz: ${quiz.quizTitle}`,
          html
        },
        opts: {
          delay,
          jobId: `quiz-notif-${quiz._id}-${user.email.toLowerCase()}-${startAt}`
        }
      };
    });

    // Add jobs to queue in batches of 100 to avoid memory issues
    const batchSize = 100;
    for (let i = 0; i < jobs.length; i += batchSize) {
      const batch = jobs.slice(i, i + batchSize);
      await Promise.all(batch.map(j => emailQueue.add(j.name, j.data, j.opts)));
    }

    console.log(`✅ Queued ${jobs.length} notifications for Quiz: ${quiz.quizTitle} (Delay: ${delay}ms)`);
    return { success: true, count: jobs.length };
  } catch (error) {
    console.error('❌ Error in notifyQuizLaunch:', error);
    throw error;
  }
};
