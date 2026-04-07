import Quiz from '../models/Quiz.js';
import Category from '../models/Category.js';
import { notifyQuizLaunch } from '../services/notificationService.js';

export const checkAndPublishQuizzes = async () => {
  try {
    const now = new Date();
    // Find quizzes that are scheduled and due for posting
    const scheduledQuizzes = await Quiz.find({
      status: 'scheduled',
      scheduledAt: { $lte: now }
    });

    if (scheduledQuizzes.length === 0) return;

    console.log(`[QuizWorker] Found ${scheduledQuizzes.length} quizzes to publish.`);

    for (const quiz of scheduledQuizzes) {
      quiz.status = 'published';
      await quiz.save();
      console.log(`[QuizWorker] Published quiz: ${quiz.quizTitle} (${quiz._id})`);

      // Trigger notifications if broadcast email is enabled
      if (quiz.broadcastEmail) {
        try {
          const cat = await Category.findById(quiz.category).select('name').lean();
          await notifyQuizLaunch(quiz, cat?.name || 'General');
          console.log(`[QuizWorker] Broadcast email sent for: ${quiz.quizTitle}`);
        } catch (notifyErr) {
          console.error(`[QuizWorker] Notification error for ${quiz._id}:`, notifyErr);
        }
      }
    }
  } catch (err) {
    console.error('[QuizWorker] Error in checkAndPublishQuizzes:', err);
  }
};
