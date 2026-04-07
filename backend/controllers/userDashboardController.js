import Quiz from '../models/Quiz.js';
import QuizAttempt from '../models/QuizAttempt.js';
import Transaction from '../models/Transaction.js';
import Wallet from '../models/Wallet.js';
import mongoose from 'mongoose';

/**
 * Get user dashboard summary stats
 * @route GET /api/user/dashboard-summary
 */
export const getDashboardSummary = async (req, res) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const userObjectId = new mongoose.Types.ObjectId(userId);

    // 1. Total Enrolled Quizzes (Distinct count from transactions + attempts)
    const [purchasedQuizzes, attemptedQuizzes] = await Promise.all([
      Transaction.distinct('quizId', { userId: userObjectId, status: 'success', quizId: { $ne: null } }),
      QuizAttempt.distinct('quizId', { userId: userObjectId })
    ]);
    const enrolledQuizIds = [...new Set([...purchasedQuizzes.map(String), ...attemptedQuizzes.map(String)])];
    const totalEnrolled = enrolledQuizIds.length;

    // 2. Active Quizzes (Distinct count of quizzes with in_progress attempts)
    const activeQuizzes = await QuizAttempt.distinct('quizId', { 
      userId: userObjectId, 
      status: 'in_progress' 
    });

    // 3. Completed Quizzes (Distinct count of quizzes with at least one submitted attempt)
    const completedQuizzesCount = await QuizAttempt.distinct('quizId', { 
      userId: userObjectId, 
      status: 'submitted' 
    });

    // 4. Wallet Balance
    const wallet = await Wallet.findOne({ userId: userObjectId }).select('balance');
    const walletBalance = wallet ? wallet.balance : 0;

    // 5. Latest In-Progress Quiz for "Resume Quiz" widget
    const latestInProgress = await QuizAttempt.findOne({ 
      userId: userObjectId, 
      status: 'in_progress' 
    })
    .sort({ updatedAt: -1 })
    .populate('quizId', 'quizTitle')
    .lean();

    // 6. Recent Activity (Last 4 submitted attempts)
    const recentAttempts = await QuizAttempt.find({ 
      userId: userObjectId, 
      status: 'submitted' 
    })
    .sort({ createdAt: -1 })
    .limit(4)
    .populate('quizId', 'quizTitle')
    .lean();

    const formattedActivities = recentAttempts.map(a => ({
      _id: a._id,
      quizTitle: a.quizId?.quizTitle || 'Unknown Quiz',
      score: a.totalScore,
      percentage: Math.round(a.percentage || 0),
      submittedAt: a.createdAt
    }));

    // 7. Total available quizzes (for "Available" stat if needed)
    // This is optional but helpful to show how many more are out there
    // const totalAvailable = await Quiz.countDocuments({ status: 'published', visibility: 'public' });

    res.json({
      summary: {
        totalEnrolled,
        activeQuizzes: activeQuizzes.length,
        completedQuizzes: completedQuizzesCount.length,
        walletBalance
      },
      latestInProgress: latestInProgress ? {
        _id: latestInProgress._id,
        quizId: latestInProgress.quizId?._id,
        quizTitle: latestInProgress.quizId?.quizTitle || 'Resumed Quiz',
        percentage: Math.round(latestInProgress.percentage || 0),
        updatedAt: latestInProgress.updatedAt
      } : null,
      recentActivities: formattedActivities
    });

  } catch (error) {
    console.error('Error fetching user dashboard summary:', error);
    res.status(500).json({ message: 'Failed to fetch dashboard summary' });
  }
};
