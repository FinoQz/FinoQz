const QuizAttempt = require('../models/QuizAttempt');
const Quiz = require('../models/Quiz');
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const Certificate = require('../models/Certificate');
const redis = require('../utils/redis');
const mongoose = require('mongoose');

/**
 * Get dashboard KPI stats
 * @route GET /api/analytics/dashboard-stats
 */
const getDashboardStats = async (req, res) => {
  try {
    // Try to get from cache
    const cacheKey = 'analytics:dashboard:stats';
    const cached = await redis.get(cacheKey);
    
    if (cached) {
      return res.json(JSON.parse(cached));
    }

    // Calculate stats
    const [
      totalUsers,
      activeUsers,
      totalQuizzes,
      activeQuizzes,
      totalAttempts,
      totalRevenue,
      certificatesIssued
    ] = await Promise.all([
      User.countDocuments({ status: { $in: ['approved', 'email_verified'] } }),
      User.countDocuments({ 
        status: 'approved',
        lastLoginAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
      }),
      Quiz.countDocuments(),
      Quiz.countDocuments({ 
        status: 'published',
        startAt: { $lte: new Date() },
        endAt: { $gte: new Date() }
      }),
      QuizAttempt.countDocuments({ status: 'submitted' }),
      Transaction.aggregate([
        { $match: { status: 'success' } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]),
      Certificate.countDocuments()
    ]);

    const stats = {
      totalUsers,
      activeUsers,
      totalQuizzes,
      activeQuizzes,
      totalAttempts,
      totalRevenue: totalRevenue[0]?.total || 0,
      certificatesIssued
    };

    // Cache for 5 minutes
    await redis.setex(cacheKey, 300, JSON.stringify(stats));

    res.json(stats);
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({ message: 'Failed to fetch dashboard stats' });
  }
};

/**
 * Get user growth data
 * @route GET /api/analytics/user-growth
 */
const getUserGrowth = async (req, res) => {
  try {
    const { dateRange = '30' } = req.query; // days
    const days = parseInt(dateRange);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const growth = await User.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            day: { $dayOfMonth: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 }
      }
    ]);

    // Format data for frontend
    const formattedData = growth.map(item => ({
      date: `${item._id.year}-${String(item._id.month).padStart(2, '0')}-${String(item._id.day).padStart(2, '0')}`,
      users: item.count
    }));

    res.json(formattedData);
  } catch (error) {
    console.error('Get user growth error:', error);
    res.status(500).json({ message: 'Failed to fetch user growth data' });
  }
};

/**
 * Get quiz performance statistics
 * @route GET /api/analytics/quiz-stats
 */
const getQuizStats = async (req, res) => {
  try {
    const { quizId } = req.query;

    const matchStage = quizId 
      ? { quizId: new mongoose.Types.ObjectId(quizId), status: 'submitted' }
      : { status: 'submitted' };

    const stats = await QuizAttempt.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: '$quizId',
          totalAttempts: { $sum: 1 },
          avgScore: { $avg: '$totalScore' },
          avgPercentage: { $avg: '$percentage' },
          maxScore: { $max: '$totalScore' },
          minScore: { $min: '$totalScore' },
          avgTimeTaken: { $avg: '$timeTaken' }
        }
      },
      {
        $lookup: {
          from: 'quizzes',
          localField: '_id',
          foreignField: '_id',
          as: 'quiz'
        }
      },
      {
        $unwind: '$quiz'
      },
      {
        $project: {
          quizId: '$_id',
          quizTitle: '$quiz.quizTitle',
          category: '$quiz.category',
          totalAttempts: 1,
          avgScore: { $round: ['$avgScore', 2] },
          avgPercentage: { $round: ['$avgPercentage', 2] },
          maxScore: 1,
          minScore: 1,
          avgTimeTaken: { $round: ['$avgTimeTaken', 0] }
        }
      },
      { $sort: { totalAttempts: -1 } }
    ]);

    res.json(stats);
  } catch (error) {
    console.error('Get quiz stats error:', error);
    res.status(500).json({ message: 'Failed to fetch quiz statistics' });
  }
};

/**
 * Get revenue analytics
 * @route GET /api/analytics/revenue
 */
const getRevenueAnalytics = async (req, res) => {
  try {
    const { dateRange = '30' } = req.query; // days
    const days = parseInt(dateRange);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const revenueData = await Transaction.aggregate([
      {
        $match: {
          status: 'success',
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            day: { $dayOfMonth: '$createdAt' }
          },
          totalRevenue: { $sum: '$amount' },
          transactionCount: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 }
      }
    ]);

    // Payment method breakdown
    const methodBreakdown = await Transaction.aggregate([
      {
        $match: {
          status: 'success',
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: '$paymentMethod',
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      }
    ]);

    const formattedData = revenueData.map(item => ({
      date: `${item._id.year}-${String(item._id.month).padStart(2, '0')}-${String(item._id.day).padStart(2, '0')}`,
      revenue: item.totalRevenue,
      transactions: item.transactionCount
    }));

    res.json({
      dailyRevenue: formattedData,
      methodBreakdown,
      totalRevenue: revenueData.reduce((sum, item) => sum + item.totalRevenue, 0),
      totalTransactions: revenueData.reduce((sum, item) => sum + item.transactionCount, 0)
    });
  } catch (error) {
    console.error('Get revenue analytics error:', error);
    res.status(500).json({ message: 'Failed to fetch revenue analytics' });
  }
};

/**
 * Get top performers leaderboard
 * @route GET /api/analytics/top-performers
 */
const getTopPerformers = async (req, res) => {
  try {
    const { limit = 10, quizId } = req.query;

    const matchStage = quizId 
      ? { quizId: new mongoose.Types.ObjectId(quizId), status: 'submitted' }
      : { status: 'submitted' };

    const topPerformers = await QuizAttempt.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: '$userId',
          totalScore: { $sum: '$totalScore' },
          avgPercentage: { $avg: '$percentage' },
          totalAttempts: { $sum: 1 },
          certificatesEarned: { $sum: { $cond: ['$certificateIssued', 1, 0] } }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user'
        }
      },
      {
        $unwind: '$user'
      },
      {
        $project: {
          userId: '$_id',
          fullName: '$user.fullName',
          email: '$user.email',
          profilePicture: '$user.profilePicture',
          totalScore: 1,
          avgPercentage: { $round: ['$avgPercentage', 2] },
          totalAttempts: 1,
          certificatesEarned: 1
        }
      },
      { $sort: { avgPercentage: -1, totalScore: -1 } },
      { $limit: parseInt(limit) }
    ]);

    res.json(topPerformers);
  } catch (error) {
    console.error('Get top performers error:', error);
    res.status(500).json({ message: 'Failed to fetch top performers' });
  }
};

/**
 * Get category-wise performance
 * @route GET /api/analytics/category-performance
 */
const getCategoryPerformance = async (req, res) => {
  try {
    const categoryStats = await QuizAttempt.aggregate([
      { $match: { status: 'submitted' } },
      {
        $lookup: {
          from: 'quizzes',
          localField: 'quizId',
          foreignField: '_id',
          as: 'quiz'
        }
      },
      {
        $unwind: '$quiz'
      },
      {
        $group: {
          _id: '$quiz.category',
          totalAttempts: { $sum: 1 },
          avgScore: { $avg: '$totalScore' },
          avgPercentage: { $avg: '$percentage' },
          totalQuizzes: { $addToSet: '$quizId' }
        }
      },
      {
        $project: {
          category: '$_id',
          totalAttempts: 1,
          avgScore: { $round: ['$avgScore', 2] },
          avgPercentage: { $round: ['$avgPercentage', 2] },
          totalQuizzes: { $size: '$totalQuizzes' }
        }
      },
      { $sort: { totalAttempts: -1 } }
    ]);

    res.json(categoryStats);
  } catch (error) {
    console.error('Get category performance error:', error);
    res.status(500).json({ message: 'Failed to fetch category performance' });
  }
};

module.exports = {
  getDashboardStats,
  getUserGrowth,
  getQuizStats,
  getRevenueAnalytics,
  getTopPerformers,
  getCategoryPerformance
};
