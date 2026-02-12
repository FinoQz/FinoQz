// Dashboard Analytics Controller
const db = require('../config/db');
const Category = require('../models/Category');
const Quiz = require('../models/Quiz');
const QuizAttempt = require('../models/QuizAttempt');

// Example: You should replace these with real DB queries
exports.getDailyRevenue = async (req, res) => {
  // TODO: Replace with real aggregation
  res.json({
    revenueData: [3200, 4100, 3800, 5200, 6300, 5800, 7100, 6800, 7800, 8200, 7500, 8900, 9200, 8450],
    days: ['Jan 5', 'Jan 6', 'Jan 7', 'Jan 8', 'Jan 9', 'Jan 10', 'Jan 11', 'Jan 12', 'Jan 13', 'Jan 14', 'Jan 15', 'Jan 16', 'Jan 17', 'Jan 18']
  });
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
    // Get all categories
    const categories = await Category.find().lean();

    // Get all quizzes, grouped by category
    const quizzes = await Quiz.find().lean();
    const quizMap = {};
    quizzes.forEach(q => {
      const catId = q.category?.toString();
      if (!quizMap[catId]) quizMap[catId] = [];
      quizMap[catId].push(q._id.toString());
    });

    // Get all quiz attempts
    const attempts = await QuizAttempt.find().lean();

    // Build result for each category
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
  // TODO: Replace with real aggregation
  res.json({
    users: [
      { name: 'Rahul Sharma', attempts: 24, badge: 'Top Performer' },
      { name: 'Priya Patel', attempts: 21, badge: 'High Activity' },
      { name: 'Amit Kumar', attempts: 19, badge: 'Consistent' },
      { name: 'Sneha Singh', attempts: 17, badge: 'Rising Star' },
      { name: 'Vikram Reddy', attempts: 15, badge: 'Active' }
    ]
  });
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
