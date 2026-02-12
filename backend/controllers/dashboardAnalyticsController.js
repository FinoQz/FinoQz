// Dashboard Analytics Controller
const db = require('../config/db');
const Category = require('../models/Category');
const Quiz = require('../models/Quiz');
const QuizAttempt = require('../models/QuizAttempt');
const Transaction = require('../models/Transaction');

// Example: You should replace these with real DB queries
exports.getDailyRevenue = async (req, res) => {
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

exports.getQuizCompletion = async (req, res) => {
  // TODO: Replace with real aggregation
  res.json({
    completed: 68,
    nonCompleted: 32,
    totalAttempts: 1248
  });
};

exports.getCategoryParticipation = async (req, res) => {
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

exports.getTopUsers = async (req, res) => {
  try {
    const { quizId, limit = 5 } = req.query;
    if (!quizId) return res.status(400).json({ message: 'quizId required' });

    // Aggregate top performers by average percentage
    const top = await QuizAttempt.aggregate([
      { $match: { quizId: require('mongoose').Types.ObjectId(quizId), status: 'submitted' } },
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

exports.getUpcomingQuizzes = async (req, res) => {
  // TODO: Replace with real aggregation
  res.json({
    quizzes: [
      { title: 'Advanced Stock Market Analysis', date: '2025-01-20', time: '10:00 AM' },
      { title: 'Tax Planning for Professionals', date: '2025-01-22', time: '02:30 PM' },
      { title: 'Cryptocurrency Investment Basics', date: '2025-01-25', time: '11:00 AM' }
    ]
  });
};

exports.getRecentAdminActions = async (req, res) => {
  // TODO: Replace with real aggregation
  res.json({
    actions: [
      { action: 'Quiz Published', detail: 'Financial Literacy Basics', time: '2 mins ago' },
      { action: 'Price Updated', detail: 'Stock Market Fundamentals', time: '15 mins ago' },
      { action: 'Refund Issued', detail: '₹299 to Amit Kumar', time: '1 hour ago' },
      { action: 'User Verified', detail: 'Sneha Singh approved', time: '2 hours ago' },
      { action: 'Quiz Edited', detail: 'Tax Planning Strategies', time: '3 hours ago' }
    ]
  });
};

exports.getActiveQuizzes = async (req, res) => {
  // TODO: Replace with real aggregation
  res.json({
    activeQuizzes: 15,
    sparkline: [8, 10, 9, 12, 14, 13, 16, 15]
  });
};

exports.getTodayRevenue = async (req, res) => {
  // TODO: Replace with real aggregation
  res.json({
    todayRevenue: 8450,
    percentageIncrease: 18,
    sparkline: [3200, 4100, 3800, 5200, 6300, 7100, 7800, 8450]
  });
};
