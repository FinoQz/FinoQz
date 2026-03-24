
// Dashboard Analytics Controller
// import { connectDB, dbHealth, logger } from '../config/db.js';
import Category from '../models/Category.js';
import Quiz from '../models/Quiz.js';
import QuizAttempt from '../models/QuizAttempt.js';
import Transaction from '../models/Transaction.js';
import QuizActivityLog from '../models/QuizActivityLog.js';


// Example: You should replace these with real DB queries
const getDailyRevenue = async (req, res) => {
  try {
    const days = [];
    const revenueData = [];
    for (let i = 13; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dayStr = date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
      days.push(dayStr);

      const start = new Date(date.setHours(0, 0, 0, 0));
      const end = new Date(date.setHours(23, 59, 59, 999));
      const total = await Transaction.aggregate([
        {
          $match: {
            createdAt: { $gte: start, $lte: end },
            status: 'success'
          }
        },
        { $group: { _id: null, sum: { $sum: '$amount' } } }
      ]);
      revenueData.push(total[0]?.sum || 0);
    }
    res.json({ revenueData, days });
  } catch (err) {
    res.status(500).json({ message: 'Server error fetching daily revenue' });
  }
};

const getQuizCompletion = async (req, res) => {
  try {
    // QuizAttempt already imported above
    // Use aggregation for accurate counts
    const agg = await QuizAttempt.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);
    let completed = 0, nonCompleted = 0, totalAttempts = 0;
    agg.forEach(row => {
      totalAttempts += row.count;
      if (row._id === 'submitted') {
        completed = row.count;
      } else {
        nonCompleted += row.count;
      }
    });
    res.json({ completed, nonCompleted, totalAttempts });
  } catch (err) {
    res.status(500).json({ message: 'Server error fetching quiz completion stats' });
  }
};

const getCategoryParticipation = async (req, res) => {
  try {
    // 1. Get all categories
    const categories = await Category.find().lean();

    // 2. Get all quizzes, grouped by category
    const quizzes = await Quiz.find().lean();
    const quizMap = {};
    quizzes.forEach(q => {
      const catId = q.category?.toString();
      if (!quizMap[catId]) quizMap[catId] = [];
      quizMap[catId].push(q._id.toString());
    });

    // 3. Get all quiz attempts
    const attempts = await QuizAttempt.find().lean();

    // 4. Build result for each category
    const palette = [
      '#a78bfa', '#f472b6', '#facc15', '#34d399', '#60a5fa', '#fb7185', '#fbbf24', '#10b981'
    ];

    const result = categories.map((cat, i) => {
      const catId = cat._id.toString();
      const quizzesInCat = quizMap[catId] || [];
      const quizCount = quizzesInCat.length;

      if (quizCount === 0) {
        return {
          name: cat.name,
          color: palette[i % palette.length],
          quizCount: 0,
          participants: 0,
          totalEnroll: 0,
          noQuiz: true,
        };
      }

      // All attempts for quizzes in this category
      const attemptsInCat = attempts.filter(a => quizzesInCat.includes(a.quizId?.toString()));
      // Unique participants
      const uniqueParticipants = new Set(attemptsInCat.map(a => a.userId?.toString()));
      // Total enrollments (sum of all quizzes' enrollments)
      const totalEnroll = quizzes
        .filter(q => q.category?.toString() === catId)
        .reduce((sum, q) => sum + (q.enrolledUsers?.length || 0), 0);

      return {
        name: cat.name,
        color: palette[i % palette.length],
        quizCount,
        participants: uniqueParticipants.size,
        totalEnroll,
        noQuiz: false,
      };
    });

    res.json({ categories: result });
  } catch (err) {
    console.error('❌ getCategoryParticipation error:', err);
    res.status(500).json({ message: 'Server error fetching category participation' });
  }
};

const getTopUsers = async (req, res) => {
  try {
    const { quizId, limit = 5 } = req.query;
    if (!quizId) return res.status(400).json({ message: 'quizId required' });

    // Aggregate top performers by average percentage
    const top = await QuizAttempt.aggregate([
      { $match: { quizId: (await import('mongoose')).default.Types.ObjectId(quizId), status: 'submitted' } },
      {
        $group: {
          _id: '$userId',
          avgPercentage: { $avg: '$percentage' },
          totalAttempts: { $sum: 1 }
        }
      },
      { $sort: { avgPercentage: -1 } },
      { $limit: Number(limit) },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user'
        }
      },
      { $unwind: '$user' },
      {
        $project: {
          userId: '$_id',
          fullName: '$user.fullName',
          email: '$user.email',
          avgPercentage: 1,
          totalAttempts: 1
        }
      }
    ]);
    res.json(top);
  } catch (err) {
    res.status(500).json({ message: 'Server error fetching leaderboard' });
  }
};

const getUpcomingQuizzes = async (req, res) => {
  try {
    const now = new Date();
    // Find published quizzes with startAt in the future
    const quizzes = await Quiz.find({
      status: 'published',
      startAt: { $gt: now }
    })
      .sort({ startAt: 1 })
      .limit(10)
      .select('_id quizTitle startAt');

    // Format for frontend
    const upcomingQuizzes = quizzes.map(q => ({
      id: q._id,
      title: q.quizTitle,
      date: q.startAt,
      time: q.startAt ? q.startAt.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : undefined
    }));

    res.json({ upcomingQuizzes });
  } catch (err) {
    console.error('❌ getUpcomingQuizzes error:', err);
    res.status(500).json({ message: 'Server error fetching upcoming quizzes' });
  }
};

// Only quiz-related admin actions from QuizActivityLog
const getRecentQuizAdminActions = async (req, res) => {
  try {
    let logs = await QuizActivityLog.find({})
      .sort({ createdAt: -1 })
      .limit(20)
      .populate('adminId', 'fullName email');

    if (!logs.length) {
      return res.json({ actions: [] });
    }

    const actions = logs.map(log => ({
      admin: log.adminId?.fullName || log.adminId?.email || 'Admin',
      action: log.action,
      quizId: log.quizId,
      time: log.createdAt ? timeAgo(log.createdAt) : ''
    }));

    res.json({ actions });
  } catch (err) {
    console.error('Error fetching recent quiz admin actions:', err);
    res.json({ actions: [] });
  }
};

// Helper to format time ago
function timeAgo(date) {
  const now = new Date();
  const seconds = Math.floor((now.getTime() - new Date(date).getTime()) / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

const getTodayRevenue = async (req, res) => {
  try {
    // Calculate today's revenue
    const now = new Date();
    const startOfToday = new Date(now.setHours(0, 0, 0, 0));
    const endOfToday = new Date(now.setHours(23, 59, 59, 999));

    // Revenue for today
    const todayAgg = await Transaction.aggregate([
      {
        $match: {
          createdAt: { $gte: startOfToday, $lte: endOfToday },
          status: 'success'
        }
      },
      { $group: { _id: null, sum: { $sum: '$amount' } } }
    ]);
    const todayRevenue = todayAgg[0]?.sum || 0;

    // Revenue for yesterday
    const startOfYesterday = new Date(startOfToday.getTime() - 24 * 60 * 60 * 1000);
    const endOfYesterday = new Date(startOfToday.getTime() - 1);
    const yesterdayAgg = await Transaction.aggregate([
      {
        $match: {
          createdAt: { $gte: startOfYesterday, $lte: endOfYesterday },
          status: 'success'
        }
      },
      { $group: { _id: null, sum: { $sum: '$amount' } } }
    ]);
    const yesterdayRevenue = yesterdayAgg[0]?.sum || 0;

    // Calculate percentage increase
    let percentageIncrease = 0;
    if (yesterdayRevenue > 0) {
      percentageIncrease = Math.round(((todayRevenue - yesterdayRevenue) / yesterdayRevenue) * 100);
    } else if (todayRevenue > 0) {
      percentageIncrease = 100;
    }

    // Sparkline: revenue for each hour of today
    const sparkline = [];
    for (let h = 0; h < 24; h++) {
      const hourStart = new Date(startOfToday.getTime() + h * 60 * 60 * 1000);
      const hourEnd = new Date(hourStart.getTime() + 59 * 60 * 1000 + 59 * 1000 + 999);
      const hourAgg = await Transaction.aggregate([
        {
          $match: {
            createdAt: { $gte: hourStart, $lte: hourEnd },
            status: 'success'
          }
        },
        { $group: { _id: null, sum: { $sum: '$amount' } } }
      ]);
      sparkline.push(hourAgg[0]?.sum || 0);
    }

    res.json({ todayRevenue, percentageIncrease, sparkline });
  } catch (err) {
    res.status(500).json({ todayRevenue: 0, percentageIncrease: 0, sparkline: [] });
  }
};

const getQuizAdminDashboard = async (req, res) => {
  try {
    // Quiz and QuizAttempt already imported above

    // Total quizzes
    const totalQuizzes = await Quiz.countDocuments();

    // Total attempts
    const totalAttempts = await QuizAttempt.countDocuments();

    // Active quizzes (status: published, startAt <= now, endAt >= now)
    const now = new Date();
    const activeQuizzes = await Quiz.countDocuments({
      status: 'published',
      startAt: { $lte: now },
      endAt: { $gte: now }
    });

    // Most attempted quiz
    const mostAttempted = await QuizAttempt.aggregate([
      { $group: { _id: '$quizId', attempts: { $sum: 1 } } },
      { $sort: { attempts: -1 } },
      { $limit: 1 }
    ]);
    let mostAttemptedQuiz = null;
    if (mostAttempted.length) {
      const quiz = await Quiz.findById(mostAttempted[0]._id).select('quizTitle');
      mostAttemptedQuiz = {
        quizTitle: quiz ? quiz.quizTitle : 'N/A',
        attempts: mostAttempted[0].attempts
      };
    }

    // Quizzes today
    const startOfDay = new Date(now.setHours(0, 0, 0, 0));
    const endOfDay = new Date(now.setHours(23, 59, 59, 999));
    const quizzesToday = await Quiz.countDocuments({
      createdAt: { $gte: startOfDay, $lte: endOfDay }
    });

    // Avg attempts per quiz
    const avgAttemptsPerQuiz = totalQuizzes > 0 ? (totalAttempts / totalQuizzes) : 0;

    res.json({
      totalQuizzes,
      totalAttempts,
      activeQuizzes,
      mostAttemptedQuiz,
      quizzesToday,
      avgAttemptsPerQuiz
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error fetching quiz admin dashboard stats' });
  }
};

// Active Quizzes for dashboard widget
const getActiveQuizzes = async (req, res) => {
  try {
    const now = new Date();
    const activeQuizzes = await Quiz.countDocuments({
      status: 'published',
      startAt: { $lte: now },
      endAt: { $gte: now }
    });
    res.json({ activeQuizzes });
  } catch (err) {
    res.status(500).json({ activeQuizzes: 0 });
  }
};

const getTopUsersCardData = async (req, res) => {
  try {
    // Get top 5 users by total score (sum of all quiz attempts)
    const agg = await QuizAttempt.aggregate([
      { $match: { status: 'submitted' } },
      {
        $group: {
          _id: '$userId',
          score: { $sum: '$totalScore' },
        }
      },
      { $sort: { score: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user',
        }
      },
      { $unwind: '$user' },
      {
        $project: {
          name: { $ifNull: ['$user.fullName', '$user.email'] },
          score: 1,
          avatar: { $ifNull: ['$user.avatar', 'https://ui-avatars.com/api/?name=' + '$user.fullName'] },
        }
      }
    ]);
    // Fallback avatar if missing
    const topUsers = agg.map(u => ({
      name: u.name || 'User',
      score: u.score || 0,
      avatar: u.avatar && u.avatar.startsWith('http') ? u.avatar : `https://ui-avatars.com/api/?name=${encodeURIComponent(u.name || 'User')}`
    }));
    res.json({ topUsers });
  } catch (err) {
    res.status(500).json({ topUsers: [] });
  }
};

export {
  getDailyRevenue,
  getQuizCompletion,
  getCategoryParticipation,
  getTopUsers,
  getTopUsersCardData,
  getUpcomingQuizzes,
  getRecentQuizAdminActions,
  getTodayRevenue,
  getQuizAdminDashboard,
  getActiveQuizzes,
};
