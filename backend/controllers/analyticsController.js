/**
 * Get total revenue for a specific quiz
 * @route GET /api/analytics/quiz-revenue
 * @query quizId (required)
 */
const getQuizRevenue = async (req, res) => {
  try {
    const { quizId } = req.query;
    if (!quizId) {
      return res.status(400).json({ message: 'quizId is required' });
    }
    // Sum all successful transactions for this quiz
    const result = await Transaction.aggregate([
      {
        $match: {
          quizId: new mongoose.Types.ObjectId(quizId),
          status: 'success'
        }
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$amount' }
        }
      }
    ]);
    const totalRevenue = result[0]?.totalRevenue || 0;
    res.json({ totalRevenue });
  } catch (error) {
    console.error('Get quiz revenue error:', error);
    res.status(500).json({ message: 'Failed to fetch quiz revenue' });
  }
};
/**
 * Get paid users count for a quiz
 * @route GET /api/analytics/quiz-paid-users
 * @query quizId (required)
 */
const getQuizPaidUsers = async (req, res) => {
  try {
    const { quizId } = req.query;
    if (!quizId) {
      return res.status(400).json({ message: 'quizId is required' });
    }
    // Find all successful transactions for this quiz
    const paidUsers = await Transaction.distinct('userId', {
      quizId: new mongoose.Types.ObjectId(quizId),
      status: 'success'
    });
    res.json({ paidUsers: paidUsers.length });
  } catch (error) {
    console.error('Get quiz paid users error:', error);
    res.status(500).json({ message: 'Failed to fetch paid users for quiz' });
  }
};
import QuizAttempt from '../models/QuizAttempt.js';
import Quiz from '../models/Quiz.js';
import User from '../models/User.js';
import Transaction from '../models/Transaction.js';
import Certificate from '../models/Certificate.js';
import ActivityLog from '../models/ActivityLog.js';
import redis from '../utils/redis.js';
import mongoose from 'mongoose';

/**
 * Internal logic for fetching registered users for a quiz
 */
const fetchQuizRegisteredUsersLogic = async (quizId) => {
  const quiz = await Quiz.findById(quizId)
    .select('visibility assignedGroups assignedIndividuals pricingType')
    .lean();
  if (!quiz) throw new Error('Quiz not found');

  let users = [];
  const visibility = quiz.visibility || 'public';

  if (visibility === 'public') {
    users = await User.find({ status: { $in: ['approved', 'active', 'email_verified'] } })
      .select('fullName email mobile city country gender profilePicture createdAt status lastLoginAt')
      .lean();
  } else if (visibility === 'private') {
    // Resolve group members
    const groupTokens = Array.isArray(quiz.assignedGroups) ? quiz.assignedGroups : [];
    if (groupTokens.length > 0) {
      const Group = (await import('../models/Group.js')).default;
      const groups = await Group.find({
        $or: [
          { _id: { $in: groupTokens.filter(t => mongoose.Types.ObjectId.isValid(t)).map(t => new mongoose.Types.ObjectId(t)) } },
          { name: { $in: groupTokens } }
        ]
      }).select('members').lean();
      const memberIds = Array.from(new Set(groups.flatMap(g => (g.members || []).map(String))));
      users = await User.find({ _id: { $in: memberIds } })
        .select('fullName email mobile city country gender profilePicture createdAt status lastLoginAt')
        .lean();
    }
  } else if (visibility === 'individual') {
    const tokens = Array.isArray(quiz.assignedIndividuals) ? quiz.assignedIndividuals : [];
    const ids = tokens.filter(t => mongoose.Types.ObjectId.isValid(t));
    const emails = tokens.filter(t => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(t));
    const criteria = [];
    if (ids.length) criteria.push({ _id: { $in: ids.map(id => new mongoose.Types.ObjectId(id)) } });
    if (emails.length) criteria.push({ email: { $in: emails.map(e => e.toLowerCase()) } });
    if (criteria.length) {
      users = await User.find({ $or: criteria })
        .select('fullName email mobile city country gender profilePicture createdAt status lastLoginAt')
        .lean();
    }
  }

  // Fallback name to email if fullName is missing
  users = users.map(u => ({
    ...u,
    fullName: u.fullName || u.name || u.email?.split('@')[0] || 'Unknown'
  }));

  return { users, total: users.length, visibility };
};

/**
 * Internal logic for fetching enrolled users for a quiz
 */
const fetchQuizEnrolledUsersLogic = async (quizId) => {
  const quiz = await Quiz.findById(quizId).select('pricingType price visibility').lean();
  if (!quiz) throw new Error('Quiz not found');

  const isPaid = quiz.pricingType === 'paid' && Number(quiz.price || 0) > 0;
  let users = [];

  if (isPaid) {
    const transactions = await Transaction.find({
      quizId: new mongoose.Types.ObjectId(quizId),
      status: 'success'
    }).populate('userId', 'fullName email mobile city country gender profilePicture createdAt status lastLoginAt').lean();
    users = transactions.map(t => {
      const u = t.userId || {};
      const nameFallback = u.fullName || u.name || u.email?.split('@')[0] || (t.userId ? `Deleted User (${t.userId})` : 'Unknown');
      return {
        ...u,
        fullName: nameFallback,
        enrolledAt: t.createdAt,
        amount: t.amount,
        transactionId: t._id
      };
    });
  } else {
    // For free quizzes, enrolled = anyone who started an attempt
    // BUT for restricted quizzes (private/individual), enrollment = being assigned
    const attempts = await QuizAttempt.find({ quizId })
      .sort({ createdAt: 1 })
      .populate('userId', 'fullName email mobile city country gender profilePicture createdAt status lastLoginAt')
      .lean();
    
    const seen = new Set();
    const attemptUsers = attempts.reduce((acc, a) => {
      const uid = String(a.userId?._id || a.userId || '');
      if (uid && !seen.has(uid)) {
        seen.add(uid);
        const u = a.userId || {};
        const nameFallback = u.fullName || u.name || u.email?.split('@')[0] || (a.userId ? `Deleted User (${a.userId})` : 'Unknown');
        acc.push({ 
          ...u, 
          fullName: nameFallback,
          enrolledAt: a.startedAt || a.createdAt 
        });
      }
      return acc;
    }, []);

    if (quiz.visibility === 'private' || quiz.visibility === 'individual') {
      // Fetch ALL assigned users and merge them
      const regRes = await fetchQuizRegisteredUsersLogic(quizId);
      const registeredUsers = regRes.users || [];
      
      registeredUsers.forEach(ru => {
        const uid = String(ru._id || '');
        if (uid && !seen.has(uid)) {
          seen.add(uid);
          attemptUsers.push({
            ...ru,
            enrolledAt: ru.createdAt // Fallback to their user creation date or just current date if needed
          });
        }
      });
    }
    users = attemptUsers;
  }

  return { users, total: users.length, isPaid };
};

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
      certificatesIssued,
      participationSplit
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
      Certificate.countDocuments(),
      // New: Participation Split (Free vs Paid Attempts)
      QuizAttempt.aggregate([
        { $match: { status: 'submitted' } },
        {
          $lookup: {
            from: 'quizzes',
            localField: 'quizId',
            foreignField: '_id',
            as: 'quiz'
          }
        },
        { $unwind: '$quiz' },
        {
          $group: {
            _id: '$quiz.pricingType',
            count: { $sum: 1 }
          }
        }
      ])
    ]);

    const participationMap = new Map();
    participationSplit.forEach(item => {
      participationMap.set(item._id, item.count);
    });

    const stats = {
      totalUsers,
      activeUsers,
      totalQuizzes,
      activeQuizzes,
      totalAttempts,
      totalRevenue: totalRevenue[0]?.total || 0,
      certificatesIssued,
      participationSplit: {
        free: participationMap.get('free') || 0,
        paid: participationMap.get('paid') || 0
      }
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

    const [userGrowth, attemptGrowth, revenueGrowth] = await Promise.all([
      // 1. User Growth
      User.aggregate([
        { $match: { createdAt: { $gte: startDate } } },
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
        { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
      ]),
      // 2. Attempt Growth
      QuizAttempt.aggregate([
        { $match: { createdAt: { $gte: startDate }, status: 'submitted' } },
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
        { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
      ]),
      // 3. Revenue Growth
      Transaction.aggregate([
        { $match: { createdAt: { $gte: startDate }, status: 'success' } },
        {
          $group: {
            _id: {
              year: { $year: '$createdAt' },
              month: { $month: '$createdAt' },
              day: { $dayOfMonth: '$createdAt' }
            },
            amount: { $sum: '$amount' }
          }
        },
        { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
      ])
    ]);

    // Merge into a unified daily timeline with zero-padding for missing days
    const dailyMap = new Map();
    
    // Pre-fill the map with all dates in the range
    for (let i = 0; i <= days; i++) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
        dailyMap.set(key, { date: key, users: 0, attempts: 0, revenue: 0 });
    }

    const getDayKey = (id) => `${id.year}-${String(id.month).padStart(2, '0')}-${String(id.day).padStart(2, '0')}`;

    userGrowth.forEach(item => {
      const key = getDayKey(item._id);
      if (dailyMap.has(key)) {
        dailyMap.get(key).users = item.count;
      }
    });

    attemptGrowth.forEach(item => {
      const key = getDayKey(item._id);
      if (dailyMap.has(key)) {
        dailyMap.get(key).attempts = item.count;
      } else if (key >= getDayKey({ year: startDate.getFullYear(), month: startDate.getMonth()+1, day: startDate.getDate() })) {
        // Fallback for dates that might be missed due to timezone shifts
        dailyMap.set(key, { date: key, users: 0, attempts: item.count, revenue: 0 });
      }
    });

    revenueGrowth.forEach(item => {
      const key = getDayKey(item._id);
      if (dailyMap.has(key)) {
        dailyMap.get(key).revenue = item.amount;
      }
    });

    // Convert map to sorted array
    const sortedData = Array.from(dailyMap.values()).sort((a, b) => a.date.localeCompare(b.date));

    res.json(sortedData);
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
        $lookup: {
          from: 'transactions',
          let: { quiz_id: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$quizId', '$$quiz_id'] },
                    { $eq: ['$status', 'success'] }
                  ]
                }
              }
            },
            { $group: { _id: null, total: { $sum: '$amount' } } }
          ],
          as: 'revenueData'
        }
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
          avgTimeTaken: { $round: ['$avgTimeTaken', 0] },
          totalRevenue: { $ifNull: [{ $arrayElemAt: ['$revenueData.total', 0] }, 0] }
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
      timeline: formattedData,
      methodBreakdown: methodBreakdown.map(m => ({
        method: m._id || 'Unknown',
        amount: m.total,
        count: m.count
      }))
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
          city: '$user.city',
          country: '$user.country',
          gender: '$user.gender',
          createdAt: '$user.createdAt',
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
          _id: { $toObjectId: '$quiz.category' }, // Convert string to ObjectId for lookup
          totalAttempts: { $sum: 1 },
          avgScore: { $avg: '$totalScore' },
          avgPercentage: { $avg: '$percentage' },
          totalQuizzes: { $addToSet: '$quizId' }
        }
      },
      {
        $lookup: {
          from: 'categories',
          localField: '_id',
          foreignField: '_id',
          as: 'categoryDoc'
        }
      },
      {
        $project: {
          category: { $ifNull: [{ $arrayElemAt: ['$categoryDoc.name', 0] }, 'Uncategorized'] },
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

/**
 * Get question-level insights for a quiz
 * @route GET /api/analytics/question-insights
 */
const getQuestionInsights = async (req, res) => {
  try {
    const { quizId } = req.query;

    if (!quizId) {
      return res.status(400).json({ message: 'quizId is required' });
    }

    const matchStage = { quizId: new mongoose.Types.ObjectId(quizId), status: 'submitted' };

    const [result] = await QuizAttempt.aggregate([
      { $match: matchStage },
      {
        $facet: {
          totals: [{ $count: 'totalAttempts' }],
          perQuestion: [
            { $unwind: '$answers' },
            {
              $group: {
                _id: '$answers.questionId',
                answeredCount: { $sum: 1 },
                correctCount: { $sum: { $cond: ['$answers.isCorrect', 1, 0] } },
                avgTime: { $avg: '$answers.timeSpent' }
              }
            },
            {
              $lookup: {
                from: 'questions',
                localField: '_id',
                foreignField: '_id',
                as: 'question'
              }
            },
            { $unwind: '$question' },
            {
              $project: {
                questionId: '$_id',
                text: '$question.text',
                answeredCount: 1,
                correctCount: 1,
                avgTime: { $round: ['$avgTime', 0] }
              }
            }
          ]
        }
      }
    ]);

    const totalAttempts = result?.totals?.[0]?.totalAttempts || 0;
    const questions = (result?.perQuestion || []).map((question) => {
      const correctRate = question.answeredCount
        ? Math.round((question.correctCount / question.answeredCount) * 100)
        : 0;
      const skippedCount = Math.max(totalAttempts - question.answeredCount, 0);
      const skipRate = totalAttempts
        ? Math.round((skippedCount / totalAttempts) * 100)
        : 0;

      return {
        ...question,
        correctRate,
        skippedCount,
        skipRate
      };
    });

    res.json({ totalAttempts, questions });
  } catch (error) {
    console.error('Get question insights error:', error);
    res.status(500).json({ message: 'Failed to fetch question insights' });
  }
};

/**
 * Get registered users for a quiz (visibility-aware)
 * - public: all platform users
 * - private: members of assignedGroups
 * - individual: assignedIndividuals (resolved to user docs)
 * @route GET /api/analytics/quiz-registered-users?quizId=...
 */
const getQuizRegisteredUsers = async (req, res) => {
  try {
    const { quizId } = req.query;
    if (!quizId) return res.status(400).json({ message: 'quizId is required' });
    const result = await fetchQuizRegisteredUsersLogic(quizId);
    res.json(result);
  } catch (error) {
    console.error('Get quiz registered users error:', error);
    res.status(error.message === 'Quiz not found' ? 404 : 500).json({ message: error.message || 'Failed to fetch registered users' });
  }
};

/**
 * Get enrolled users for a quiz
 * - paid quiz: users with successful transactions
 * - free quiz: unique users who started an attempt
 * @route GET /api/analytics/quiz-enrolled-users?quizId=...
 */
const getQuizEnrolledUsers = async (req, res) => {
  try {
    const { quizId } = req.query;
    if (!quizId) return res.status(400).json({ message: 'quizId is required' });
    const result = await fetchQuizEnrolledUsersLogic(quizId);
    res.json(result);
  } catch (error) {
    console.error('Get quiz enrolled users error:', error);
    res.status(error.message === 'Quiz not found' ? 404 : 500).json({ message: error.message || 'Failed to fetch enrolled users' });
  }
};

/**
 * Get participants (attempted users) for a quiz with full details
 * Supports filters: search, paymentStatus, attemptStatus, scoreMin, scoreMax, dateFrom, dateTo
 * @route GET /api/analytics/quiz-participants?quizId=...
 */
const getQuizParticipants = async (req, res) => {
  try {
    const { quizId, search, paymentStatus, attemptStatus, scoreMin, scoreMax, dateFrom, dateTo } = req.query;
    if (!quizId) return res.status(400).json({ message: 'quizId is required' });

    const quiz = await Quiz.findById(quizId).select('pricingType price totalMarks').lean();
    if (!quiz) return res.status(404).json({ message: 'Quiz not found' });

    const attemptQuery = { quizId: new mongoose.Types.ObjectId(quizId) };
    if (attemptStatus && attemptStatus !== 'all') attemptQuery.status = attemptStatus;
    if (dateFrom || dateTo) {
      attemptQuery.startedAt = {};
      if (dateFrom) attemptQuery.startedAt.$gte = new Date(dateFrom);
      if (dateTo) attemptQuery.startedAt.$lte = new Date(dateTo);
    }

    let attempts = await QuizAttempt.find(attemptQuery)
      .populate('userId', 'fullName email mobile city country gender profilePicture createdAt status lastLoginAt')
      .sort({ startedAt: -1 })
      .lean();

    // Fetch transactions for payment status
    const userIds = [...new Set(attempts.map(a => String(a.userId?._id || a.userId || '')).filter(Boolean))];
    const transactions = await Transaction.find({
      quizId: new mongoose.Types.ObjectId(quizId),
      userId: { $in: userIds }
    }).select('userId status amount createdAt').lean();
    const txnMap = new Map();
    transactions.forEach(t => { txnMap.set(String(t.userId), t); });

    // Compute correct/incorrect counts per attempt
    const enriched = attempts.map(a => {
      const uid = String(a.userId?._id || a.userId || '');
      const txn = txnMap.get(uid);
      const isFreeQuiz = quiz.pricingType === 'free';
      const pStatus = isFreeQuiz ? 'free' : (txn?.status === 'success' ? 'paid' : txn?.status === 'pending' ? 'pending' : 'unpaid');
      
      const correctCount = (a.answers || []).filter(ans => ans.isCorrect).length;
      const incorrectCount = (a.answers || []).filter(ans => !ans.isCorrect).length;
      const totalQ = (a.answers || []).length;
      const user = a.userId || {};
      const rawUserId = String(user._id || a.userId || '');
      
      // Compute display name from fullName or fallback fields
      const displayName = user.fullName || user.name || (user.email ? user.email.split('@')[0] : `User-${rawUserId.slice(-4)}`);
      
      return {
        attemptId: String(a._id),
        userId: rawUserId,
        name: displayName,
        email: user.email || 'N/A',
        phone: user.mobile || user.phone || 'N/A', 
        city: user.city || '—',
        country: user.country || '—',
        gender: user.gender || '—',
        userStatus: user.status || '—',
        joinDate: user.createdAt || null,
        enrolledAt: user.createdAt || null,
        startedAt: a.startedAt || null,
        submittedAt: a.submittedAt || null,
        timeTaken: a.timeTaken || null,
        attemptStatus: a.status || 'in_progress',
        score: typeof a.percentage === 'number' ? Math.round(a.percentage * 10) / 10 : null,
        totalScore: a.totalScore || 0,
        totalMarks: quiz.totalMarks || 0,
        correctCount,
        incorrectCount,
        totalQuestions: totalQ,
        paymentStatus: pStatus,
        paymentMethod: isFreeQuiz ? 'FREE' : (txn?.paymentMethod || '—'),
        paidAmount: txn?.amount || 0,
      };
    });

    // If includeEnrolled is true (or by default for admin views), merge with enrolled users who haven't attempted
    const includeEnrolled = req.query.includeEnrolled !== 'false'; // Default to true if not specified
    let finalParticipants = enriched;

    if (includeEnrolled) {
      const enrollmentRes = await fetchQuizEnrolledUsersLogic(quizId);
      const enrolledUsers = enrollmentRes.users || [];
      
      const attemptedUserIds = new Set(enriched.map(e => e.userId));
      
      enrolledUsers.forEach(eu => {
        const uid = String(eu._id || '');
        if (uid && !attemptedUserIds.has(uid)) {
          finalParticipants.push({
            attemptId: `not-started-${uid}`,
            userId: uid,
            name: eu.fullName || eu.name || eu.email?.split('@')[0] || (eu._id ? `Deleted User (${String(eu._id).slice(-6)})` : 'Unknown'),
            email: eu.email || 'N/A',
            phone: eu.mobile || eu.phone || 'N/A',
            city: eu.city || '—',
            country: eu.country || '—',
            gender: eu.gender || '—',
            userStatus: eu.status || '—',
            joinDate: eu.createdAt || null,
            enrolledAt: eu.enrolledAt || eu.createdAt || null,
            startedAt: null,
            submittedAt: null,
            timeTaken: null,
            attemptStatus: 'not-attempted',
            score: null,
            totalScore: 0,
            totalMarks: quiz.totalMarks || 0,
            correctCount: 0,
            incorrectCount: 0,
            totalQuestions: 0,
            paymentStatus: eu.amount ? 'paid' : 'unpaid',
            paidAmount: eu.amount || 0,
          });
        }
      });
    }

    // Apply in-memory filters
    let filtered = finalParticipants;
    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter(u => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q));
    }
    if (paymentStatus && paymentStatus !== 'all') {
      filtered = filtered.filter(u => u.paymentStatus === paymentStatus);
    }
    if (scoreMin !== undefined && scoreMin !== '') {
      filtered = filtered.filter(u => u.score === null || u.score >= Number(scoreMin));
    }
    if (scoreMax !== undefined && scoreMax !== '') {
      filtered = filtered.filter(u => u.score === null || u.score <= Number(scoreMax));
    }

    res.json({ participants: filtered, total: filtered.length });
  } catch (error) {
    console.error('Get quiz participants error:', error);
    res.status(500).json({ message: 'Failed to fetch participants' });
  }
};

/**
 * Get question-by-question analysis for a specific user attempt
 * @route GET /api/analytics/attempt-analysis/:attemptId
 */
const getAttemptAnalysis = async (req, res) => {
  try {
    const { attemptId } = req.params;
    if (!attemptId) return res.status(400).json({ message: 'attemptId is required' });

    const attempt = await QuizAttempt.findById(attemptId)
      .populate('userId', 'fullName email')
      .populate('quizId', 'quizTitle totalMarks pricingType price')
      .populate({
        path: 'answers.questionId',
        select: 'text options correct explanation marks type'
      })
      .lean();

    if (!attempt) return res.status(404).json({ message: 'Attempt not found' });

    // Transform data for a cleaner frontend experience
    const analysis = {
      attemptId: attempt._id,
      user: {
        name: attempt.userId?.fullName || 'Unknown',
        email: attempt.userId?.email || 'N/A'
      },
      quiz: {
        title: attempt.quizId?.quizTitle || 'Deleted Quiz',
        totalMarks: attempt.quizId?.totalMarks || 0
      },
      summary: {
        score: attempt.totalScore,
        percentage: attempt.percentage,
        timeTaken: attempt.timeTaken,
        submittedAt: attempt.submittedAt,
        status: attempt.status
      },
      questions: (attempt.answers || []).map((ans, idx) => {
        const q = ans.questionId || {};
        return {
          index: idx + 1,
          questionId: q._id,
          text: q.text || 'Question text unavailable',
          type: q.type || 'mcq',
          options: q.options || [],
          correctAnswer: q.correct,
          selectedAnswer: ans.selectedAnswer,
          isCorrect: ans.isCorrect,
          marksAwarded: ans.marksAwarded,
          maxMarks: q.marks || 1,
          timeSpent: ans.timeSpent || 0,
          explanation: q.explanation || ''
        };
      })
    };

    res.json(analysis);
  } catch (error) {
    console.error('Get attempt analysis error:', error);
    res.status(500).json({ message: 'Failed to fetch attempt analysis' });
  }
};

/**
 * Get city-wise user distribution (two sources: profile + IP geo)
 * @route GET /api/analytics/user-locations
 */
const getUserLocations = async (req, res) => {
  try {
    // Source 1: Users who filled their city in profile
    const profileCities = await User.aggregate([
      { $match: { city: { $exists: true, $nin: [null, ''] } } },
      { $group: { _id: { $trim: { input: '$city' } }, count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 20 }
    ]);

    // Source 2: ActivityLogs with geo-resolved locations (format: "City, Country")
    const activityLocations = await ActivityLog.aggregate([
      {
        $match: {
          location: { $exists: true, $nin: [null, '', 'Unknown', 'Localhost'] },
          actorType: 'user'
        }
      },
      // Extract just the city part (before the comma)
      {
        $addFields: {
          city: {
            $trim: {
              input: {
                $arrayElemAt: [{ $split: ['$location', ','] }, 0]
              }
            }
          }
        }
      },
      { $match: { city: { $nin: ['Unknown City', 'Unknown', ''] } } },
      // Count unique users per city (deduplicate by actorId per day)
      {
        $group: {
          _id: { city: '$city', actorId: '$actorId' }
        }
      },
      {
        $group: {
          _id: '$_id.city',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 20 }
    ]);

    // Merge both sources - prefer profile cities if available, supplement with activity
    const cityMap = new Map();

    profileCities.forEach(c => {
      if (c._id) cityMap.set(c._id, { city: c._id, profileCount: c.count, activityCount: 0, total: c.count });
    });

    activityLocations.forEach(c => {
      if (!c._id) return;
      if (cityMap.has(c._id)) {
        const existing = cityMap.get(c._id);
        existing.activityCount = c.count;
        existing.total = existing.profileCount + c.count;
        cityMap.set(c._id, existing);
      } else {
        cityMap.set(c._id, { city: c._id, profileCount: 0, activityCount: c.count, total: c.count });
      }
    });

    const merged = Array.from(cityMap.values())
      .sort((a, b) => b.total - a.total)
      .slice(0, 15);

    res.json({ cities: merged });
  } catch (error) {
    console.error('Get user locations error:', error);
    res.status(500).json({ message: 'Failed to fetch user location data' });
  }
};

export {
  getDashboardStats,
  getUserGrowth,
  getQuizStats,
  getRevenueAnalytics,
  getTopPerformers,
  getCategoryPerformance,
  getQuestionInsights,
  getQuizPaidUsers,
  getQuizRevenue,
  getQuizRegisteredUsers,
  getQuizEnrolledUsers,
  getQuizParticipants,
  getAttemptAnalysis,
  getUserLocations
};
