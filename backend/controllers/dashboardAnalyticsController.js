
import Category from '../models/Category.js';
import Quiz from '../models/Quiz.js';
import QuizAttempt from '../models/QuizAttempt.js';
import Transaction from '../models/Transaction.js';
import QuizActivityLog from '../models/QuizActivityLog.js';
import ActivityLog from '../models/ActivityLog.js';
import User from '../models/User.js';
import Admin from '../models/Admin.js';
import Group from '../models/Group.js';
import redis from '../utils/redis.js';
import { emitAnalyticsUpdate, emitLiveUserStats } from '../utils/emmiters.js';
import { buildDashboardStats, emitDashboardStats } from '../utils/dashboardTelemetry.js';
import mongoose from 'mongoose';


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
    const categories = await Category.find().lean();
    const quizzes = await Quiz.find().lean();
    const quizMap = {};
    quizzes.forEach(q => {
      const catId = q.category?.toString();
      if (!quizMap[catId]) quizMap[catId] = [];
      quizMap[catId].push(q._id.toString());
    });

    const attempts = await QuizAttempt.find().lean();
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

      const attemptsInCat = attempts.filter(a => quizzesInCat.includes(a.quizId?.toString()));
      const uniqueParticipants = new Set(attemptsInCat.map(a => a.userId?.toString()));
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

    const top = await QuizAttempt.aggregate([
      { $match: { quizId: new mongoose.Types.ObjectId(quizId), status: 'submitted' } },
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
    const quizzes = await Quiz.find({
      status: 'published',
      startAt: { $gt: now }
    })
      .sort({ startAt: 1 })
      .limit(10);

    const upcomingQuizzes = quizzes.map(q => ({
      id: q._id,
      title: q.quizTitle,
      date: q.startAt,
      time: q.startAt ? q.startAt.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : undefined,
      pricingType: q.pricingType,
      visibility: q.visibility,
    }));

    res.json({ upcomingQuizzes });
  } catch (err) {
    console.error('❌ getUpcomingQuizzes error:', err);
    res.status(500).json({ message: 'Server error fetching upcoming quizzes' });
  }
};

const getRecentQuizAdminActions = async (req, res) => {
  try {
    let logs = await QuizActivityLog.find({})
      .sort({ createdAt: -1 })
      .limit(20)
      .populate('adminId', 'fullName email');

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
    const now = new Date();
    const startOfToday = new Date(now.setHours(0, 0, 0, 0));
    const endOfToday = new Date(now.setHours(23, 59, 59, 999));

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

    let percentageIncrease = 0;
    if (yesterdayRevenue > 0) {
      percentageIncrease = Math.round(((todayRevenue - yesterdayRevenue) / yesterdayRevenue) * 100);
    } else if (todayRevenue > 0) {
      percentageIncrease = 100;
    }

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
    const totalQuizzes = await Quiz.countDocuments();
    const totalAttempts = await QuizAttempt.countDocuments();
    const now = new Date();
    const activeQuizzes = await Quiz.countDocuments({
      status: 'published',
      startAt: { $lte: now },
      endAt: { $gte: now }
    });

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

    const startOfDay = new Date(now.setHours(0, 0, 0, 0));
    const endOfDay = new Date(now.setHours(23, 59, 59, 999));
    const quizzesToday = await Quiz.countDocuments({
      createdAt: { $gte: startOfDay, $lte: endOfDay }
    });

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

const getConversionFunnel = async (req, res) => {
  try {
    const [signups, approvedUsers, paidEnrollments] = await Promise.all([
      User.countDocuments({}),
      User.countDocuments({ status: 'approved' }),
      User.countDocuments({ isPaidUser: true }),
    ]);

    // Approximate landing visits as Signups * 2.5 until proper tracker is added
    const landingVisits = Math.round(signups * 2.5);

    res.json({
      landingVisits,
      signups,
      approvedUsers,
      paidEnrollments
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error fetching funnel' });
  }
};

const getPrivateGroupsHealth = async (req, res) => {
  try {
    const groups = await Group.find().lean();
    const totalGroups = groups.length;
    const totalMembers = groups.reduce((acc, g) => acc + (g.members?.length || 0), 0);

    const groupDetails = await Promise.all(groups.map(async (g) => {
      const attempts = await QuizAttempt.countDocuments({ userId: { $in: g.members } });
      const completed = await QuizAttempt.countDocuments({ userId: { $in: g.members }, status: 'submitted' });
      const completionRate = attempts > 0 ? Math.round((completed / attempts) * 100) : 0;
      return {
        name: g.name,
        members: g.members?.length || 0,
        completionRate
      };
    }));

    const avgCompletion = groupDetails.length > 0 
      ? Math.round(groupDetails.reduce((acc, g) => acc + g.completionRate, 0) / groupDetails.length)
      : 0;

    res.json({
      totalGroups,
      totalMembers,
      avgCompletion,
      groups: groupDetails.sort((a, b) => b.members - a.members)
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error fetching group health' });
  }
};

const getPlatformPulse = async (req, res) => {
  try {
    const logs = await ActivityLog.find()
      .sort({ createdAt: -1 })
      .limit(15)
      .lean();

    const activities = await Promise.all(logs.map(async (log) => {
      let userName = 'System';
      try {
        if (log.actorId) {
          // Map 'admin'/'user' actorType string to actual 'Admin'/'User' model names
          const modelName = log.actorType === 'admin' ? 'Admin' : 'User';
          const Model = mongoose.model(modelName);
          const actor = await Model.findById(log.actorId).select('fullName email username').lean();
          userName = actor?.fullName || actor?.username || actor?.email || 'Unknown';
        }
      } catch (e) {
        console.error("Pulse user fetch error:", e);
      }

      return {
        _id: log._id.toString(),
        type: log.action.includes('approve') ? 'approval' :
              log.action.includes('reject') ? 'rejection' :
              log.action.includes('payment') || log.action.includes('transaction') ? 'payment' :
              log.action.includes('signup') || log.action.includes('register') ? 'enrollment' : 'system',
        user: userName,
        detail: log.action.replace(/_/g, ' '),
        timestamp: log.createdAt
      };
    }));

    res.json({ activities });
  } catch (err) {
    console.error("❌ getPlatformPulse error:", err);
    res.status(500).json({ activities: [], message: 'Pulse aggregation failed' });
  }
};

const getUserGrowthData = async (req, res) => {
  try {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();
    const startDate = new Date(year, month, 1);
    const endDate = new Date(year, month + 1, 0);
    const cacheKey = `dashboard:userGrowth:${year}-${month + 1}`;

    const cached = await redis.get(cacheKey);
    if (cached) {
      return res.json(JSON.parse(cached));
    }

    const results = await User.aggregate([
      { $match: { createdAt: { $gte: startDate, $lte: endDate } } },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]);

    const resultMap = Object.fromEntries(results.map(r => [r._id, r.count]));
    const labels = [];
    const values = [];
    for (let i = 1; i <= endDate.getDate(); i++) {
      const date = new Date(year, month, i);
      const isoDate = date.toISOString().split('T')[0];
      labels.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
      values.push(resultMap[isoDate] || 0);
    }

    const payload = { labels, values };
    await redis.set(cacheKey, JSON.stringify(payload), 'EX', 3600);
    return res.json(payload);
  } catch (err) {
    res.status(500).json({ message: 'Internal server error' });
  }
};

const getLiveUsers = async (req, res) => {
  try {
    const liveUserCount = await redis.scard('liveUsers');
    await redis.lpush('liveUserSparkline', liveUserCount);
    await redis.ltrim('liveUserSparkline', 0, 19);
    const sparklineRaw = await redis.lrange('liveUserSparkline', 0, -1);
    const sparkline = sparklineRaw.map(Number).reverse();

    return res.json({ liveUsers: liveUserCount, sparkline });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch live users' });
  }
};

const getDashboardStats = async (req, res) => {
  try {
    const cached = await redis.get("dashboard:stats");
    if (cached) {
      return res.json(JSON.parse(cached));
    }

    const [
      totalUsers,
      activeUsers,
      pendingApprovals,
      totalRevenueAgg,
      totalPaidUsers,
      freeQuizAttemptsAgg,
    ] = await Promise.all([
      User.countDocuments({}),
      User.countDocuments({ status: "approved" }),
      User.countDocuments({ status: "awaiting_admin_approval" }),
      User.aggregate([{ $group: { _id: null, total: { $sum: "$totalSpent" } } }]),
      User.countDocuments({ isPaidUser: true }),
      User.aggregate([{ $group: { _id: null, total: { $sum: "$freeQuizAttempts" } } }]),
    ]);

    const stats = {
      totalUsers,
      activeUsers,
      pendingApprovals,
      totalRevenue: (Array.isArray(totalRevenueAgg) && totalRevenueAgg[0]?.total) || 0,
      totalPaidUsers,
      freeQuizAttempts: (Array.isArray(freeQuizAttemptsAgg) && freeQuizAttemptsAgg[0]?.total) || 0,
    };

    await redis.set("dashboard:stats", JSON.stringify(stats), "EX", 60);
    return res.json(stats);
  } catch (err) {
    console.error("❌ getDashboardStats error:", err);
    return res.status(500).json({ message: 'Failed to fetch dashboard stats' });
  }
};

const getMonthlyUsers = async (req, res) => {
  try {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const startOfCurrentMonth = new Date(year, month, 1);
    const startOfLastMonth = new Date(year, month - 1, 1);
    const endOfLastMonth = new Date(year, month, 0);
    const cacheKey = `dashboard:monthlyUsers:${year}-${month + 1}`;

    const cached = await redis.get(cacheKey);
    if (cached) {
      return res.json(JSON.parse(cached));
    }

    const [currentMonthCount, lastMonthCount] = await Promise.all([
      User.countDocuments({ createdAt: { $gte: startOfCurrentMonth } }),
      User.countDocuments({ createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth } }),
    ]);

    const payload = { currentMonth: currentMonthCount, lastMonth: lastMonthCount };
    await redis.set(cacheKey, JSON.stringify(payload), 'EX', 3600);
    return res.json(payload);
  } catch (err) {
    res.status(500).json({ message: 'Internal server error' });
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
  getConversionFunnel,
  getPrivateGroupsHealth,
  getPlatformPulse,
  getUserGrowthData,
  getLiveUsers,
  getDashboardStats,
  getMonthlyUsers,
  emitDashboardStats,
  buildDashboardStats
};
