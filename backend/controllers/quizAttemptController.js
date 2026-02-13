const QuizAttempt = require('../models/QuizAttempt');
const Quiz = require('../models/Quiz');
const Question = require('../models/Question');
const Certificate = require('../models/Certificate');
const Notification = require('../models/Notification');
const mongoose = require('mongoose');

const getRequestUserId = (req) => {
  return req.userId || req.user?._id || req.user?.id || req.user?.userId || null;
};

/**
 * Start a new quiz attempt
 * @route POST /api/quiz-attempts/start
 */
const startAttempt = async (req, res) => {
  const { quizId } = req.body;
  const userId = getRequestUserId(req);
  if (!userId) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  // 1. Quiz fetch karo
  const quiz = await Quiz.findById(quizId);
  if (!quiz) return res.status(404).json({ message: 'Quiz not found' });

  // 2. User ke previous attempts count karo
  const attemptsCount = await QuizAttempt.countDocuments({ quizId, userId });

  // 3. Max attempts check karo
  if (quiz.maxAttempts && attemptsCount >= quiz.maxAttempts) {
    return res.status(400).json({ message: 'Maximum attempts reached' });
  }

  // 4. Naya attempt create karo
  const attempt = await QuizAttempt.create({
    quizId,
    userId,
    status: 'in_progress', // Correct value as per model
    startedAt: new Date(),
    answers: []
  });

  res.json({ attemptId: attempt._id });
};

/**
 * Save an answer for a question
 * @route POST /api/quiz-attempts/:attemptId/answer
 */
const saveAnswer = async (req, res) => {
  try {
    const { attemptId } = req.params;
    const { questionId, selectedAnswer, timeSpent } = req.body;
    const userId = getRequestUserId(req);
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // Find attempt and verify ownership
    const attempt = await QuizAttempt.findOne({ _id: attemptId, userId });
    if (!attempt) {
      return res.status(404).json({ message: 'Attempt not found' });
    }

    if (attempt.status !== 'in_progress') {
      return res.status(400).json({ message: 'Attempt is not in progress' });
    }

    // Get question to check correct answer
    const question = await Question.findById(questionId);
    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    // Check if answer is correct
    let isCorrect = false;
    let marksAwarded = 0;

    if (Array.isArray(question.correct)) {
      const correctAnswers = question.correct.map(String).sort();
      const selectedAnswers = Array.isArray(selectedAnswer)
        ? selectedAnswer.map(String).sort()
        : [String(selectedAnswer)];
      isCorrect = JSON.stringify(correctAnswers) === JSON.stringify(selectedAnswers);
    } else {
      isCorrect = String(selectedAnswer) === String(question.correct);
    }
    marksAwarded = isCorrect ? question.marks : 0;

    // Update or add answer
    const existingAnswerIndex = attempt.answers.findIndex(
      a => a.questionId.toString() === questionId
    );

    if (existingAnswerIndex >= 0) {
      attempt.answers[existingAnswerIndex] = {
        questionId,
        selectedAnswer,
        isCorrect,
        marksAwarded,
        timeSpent: timeSpent || 0
      };
    } else {
      attempt.answers.push({
        questionId,
        selectedAnswer,
        isCorrect,
        marksAwarded,
        timeSpent: timeSpent || 0
      });
    }

    await attempt.save();

    res.json({
      message: 'Answer saved',
      isCorrect,
      marksAwarded
    });
  } catch (error) {
    console.error('Save answer error:', error);
    res.status(500).json({ message: 'Failed to save answer' });
  }
};

/**
 * Submit quiz attempt and calculate final score
 * @route POST /api/quiz-attempts/:attemptId/submit
 */
const submitAttempt = async (req, res) => {
  try {
    const { attemptId } = req.params;
    const userId = getRequestUserId(req);
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // Find attempt
    const attempt = await QuizAttempt.findOne({ _id: attemptId, userId });
    if (!attempt) {
      return res.status(404).json({ message: 'Attempt not found' });
    }

    if (attempt.status !== 'in_progress') {
      return res.status(400).json({ message: 'Attempt already submitted' });
    }

    // Get quiz details
    const quiz = await Quiz.findById(attempt.quizId);
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    // Calculate total score
    const totalScore = attempt.answers.reduce((sum, answer) => sum + answer.marksAwarded, 0);
    const percentage = (totalScore / quiz.totalMarks) * 100;
    const timeTaken = Math.floor((Date.now() - attempt.startedAt.getTime()) / 1000);

    // Update attempt
    attempt.totalScore = totalScore;
    attempt.percentage = percentage;
    attempt.timeTaken = timeTaken;
    attempt.submittedAt = new Date();
    attempt.status = 'submitted';

    await attempt.save();

    // Update quiz participant count
    quiz.participantCount = (quiz.participantCount || 0) + 1;
    await quiz.save();

    // Check if certificate should be issued (e.g., if passed with 50%+)
    let certificateIssued = false;
    if (percentage >= 50) {
      // Generate certificate (will be handled by certificateController)
      attempt.certificateIssued = true;
      await attempt.save();
      certificateIssued = true;

      // Create notification
      await Notification.create({
        userId,
        type: 'certificate',
        title: 'Certificate Available!',
        message: `Congratulations! You've earned a certificate for ${quiz.quizTitle}`,
        metadata: { quizId: quiz._id, attemptId: attempt._id }
      });
    }

    // Emit socket event for real-time update
    const io = req.app.get('io');
    if (io) {
      io.to('admin-room').emit('quiz:submitted', {
        attemptId: attempt._id,
        quizId: quiz._id,
        userId,
        score: totalScore,
        percentage
      });
    }

    res.json({
      message: 'Quiz submitted successfully',
      totalScore,
      percentage,
      timeTaken,
      certificateIssued,
      attemptId: attempt._id
    });
  } catch (error) {
    console.error('Submit attempt error:', error);
    res.status(500).json({ message: 'Failed to submit quiz' });
  }
};

/**
 * Get specific attempt details
 * @route GET /api/quiz-attempts/:attemptId
 */
const getAttemptDetails = async (req, res) => {
  try {
    const { attemptId } = req.params;
    const userId = getRequestUserId(req);
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const isAdmin = (req.role || req.user?.role) === 'admin';

    const query = isAdmin ? { _id: attemptId } : { _id: attemptId, userId };
    
    const attempt = await QuizAttempt.findOne(query)
      .populate('userId', 'fullName email')
      .populate('quizId', 'quizTitle totalMarks duration')
      .populate('answers.questionId', 'text type marks');

    if (!attempt) {
      return res.status(404).json({ message: 'Attempt not found' });
    }

    res.json(attempt);
  } catch (error) {
    console.error('Get attempt details error:', error);
    res.status(500).json({ message: 'Failed to fetch attempt details' });
  }
};

/**
 * Get all attempts by a user
 * @route GET /api/quiz-attempts/user/all
 */
const getUserAttempts = async (req, res) => {
  try {
    const userId = getRequestUserId(req);
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const { page = 1, limit = 10, status } = req.query;

    const query = { userId };
    if (status) {
      query.status = status;
    }

    const attempts = await QuizAttempt.find(query)
      .populate('quizId', 'quizTitle category totalMarks')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await QuizAttempt.countDocuments(query);

    res.json({
      attempts,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: count
    });
  } catch (error) {
    console.error('Get user attempts error:', error);
    res.status(500).json({ message: 'Failed to fetch attempts' });
  }
};

/**
 * Get all attempts for a specific quiz (Admin only)
 * @route GET /api/quiz-attempts/quiz/:quizId
 */
const getAttemptsByQuiz = async (req, res) => {
  try {
    const { quizId } = req.params;
    const { page = 1, limit = 20, status, dateRange } = req.query;

    const query = { quizId };
    if (status) {
      query.status = status;
    }

    // Add date range filter if provided
    if (dateRange) {
      const [startDate, endDate] = dateRange.split(',');
      query.submittedAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const attempts = await QuizAttempt.find(query)
      .populate('userId', 'fullName email')
      .sort({ submittedAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await QuizAttempt.countDocuments(query);

    // Calculate statistics
    const stats = await QuizAttempt.aggregate([
      { $match: { quizId: new mongoose.Types.ObjectId(quizId), status: 'submitted' } },
      {
        $group: {
          _id: null,
          avgScore: { $avg: '$totalScore' },
          avgPercentage: { $avg: '$percentage' },
          maxScore: { $max: '$totalScore' },
          minScore: { $min: '$totalScore' },
          totalAttempts: { $sum: 1 }
        }
      }
    ]);

    res.json({
      attempts,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: count,
      stats: stats[0] || {}
    });
  } catch (error) {
    console.error('Get attempts by quiz error:', error);
    res.status(500).json({ message: 'Failed to fetch quiz attempts' });
  }
};

/**
 * Get detailed result for a quiz attempt
 * @route GET /api/quiz-attempts/:attemptId/result
 */
const getAttemptResult = async (req, res) => {
  try {
    const { attemptId } = req.params;
    const userId = getRequestUserId(req);
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const attempt = await QuizAttempt.findById(attemptId)
      .populate('quizId', 'quizTitle attemptLimit')
      .lean();

    if (!attempt) {
      return res.status(404).json({ message: 'Attempt not found' });
    }

    // Verify user owns this attempt
    if (!attempt.userId || attempt.userId.toString() !== userId.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Get questions with correct answers and explanations
    const questionIds = attempt.answers.map(a => a.questionId);
    const questions = await Question.find({ _id: { $in: questionIds } })
      .select('text options correct explanation marks')
      .lean();

    // Create a map for quick lookup
    const questionMap = new Map(questions.map(q => [q._id.toString(), q]));

    // Enrich answers with question details
    const enrichedAnswers = attempt.answers.map(answer => {
      const question = questionMap.get(answer.questionId.toString());
      if (!question) return null;

      return {
        questionId: answer.questionId,
        questionText: question.text,
        selectedAnswer: answer.selectedAnswer,
        correctAnswer: question.correct,
        isCorrect: answer.isCorrect,
        marksAwarded: answer.marksAwarded,
        marksAllocated: question.marks,
        timeSpent: answer.timeSpent || 0,
        options: question.options,
        explanation: question.explanation
      };
    }).filter(Boolean);

    // Calculate pass percentage (default 50%)
    const passPercentage = 50;
    const passed = attempt.percentage >= passPercentage;

    // Check for certificate
    let certificateId = null;
    if (passed && attempt.certificateIssued) {
      const certificate = await Certificate.findOne({
        attemptId: attempt._id
      }).select('_id').lean();
      if (certificate) {
        certificateId = certificate._id;
      }
    }

    // Count correct and incorrect
    const correctAnswers = enrichedAnswers.filter(a => a.isCorrect).length;
    const incorrectAnswers = enrichedAnswers.filter(a => !a.isCorrect).length;
    const totalQuestions = enrichedAnswers.length;

    // Check if retake is allowed
    const quizData = typeof attempt.quizId === 'object' ? attempt.quizId : { attemptLimit: '1' };
    const allowRetake = quizData.attemptLimit === 'unlimited' || 
                        attempt.attemptNumber < parseInt(quizData.attemptLimit || '1');

    const result = {
      attemptId: attempt._id,
      quizTitle: quizData.quizTitle || 'Quiz',
      totalScore: attempt.totalScore,
      totalMarks: quizData.totalMarks || enrichedAnswers.reduce((sum, a) => sum + a.marksAllocated, 0),
      percentage: attempt.percentage,
      timeTaken: attempt.timeTaken,
      totalQuestions,
      correctAnswers,
      incorrectAnswers,
      unanswered: 0, // All questions are answered in submit
      passed,
      passPercentage,
      attemptNumber: attempt.attemptNumber,
      submittedAt: attempt.submittedAt,
      answers: enrichedAnswers,
      allowRetake,
      certificateEligible: passed,
      certificateId
    };

    res.json({
      data: result,
      message: 'Result fetched successfully'
    });
  } catch (error) {
    console.error('Get attempt result error:', error);
    res.status(500).json({ message: 'Failed to fetch result' });
  }
};

/**
 * Get all quiz attempts (Admin only, for reports/analytics)
 * @route GET /api/quiz-attempts/all
 */
const getAllAttempts = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      status,
      dateRange,
      quizId,
      userId,
      search
    } = req.query;

    const query = {};
    if (status && status !== 'all') query.status = status;
    if (quizId && quizId !== 'all') query.quizId = quizId;
    if (userId && userId !== 'all') query.userId = userId;

    // Date range filter (on submittedAt)
    if (dateRange && dateRange !== 'all') {
      const days = parseInt(dateRange);
      const fromDate = new Date();
      fromDate.setDate(fromDate.getDate() - days);
      query.submittedAt = { $gte: fromDate };
    }

    // Search by user name or email (populate and filter in-memory)
    let attemptsQuery = QuizAttempt.find(query)
      .populate('userId', 'fullName email')
      .populate('quizId', 'quizTitle type totalMarks')
      .sort({ submittedAt: -1 });

    // Pagination
    attemptsQuery = attemptsQuery.limit(Number(limit)).skip((Number(page) - 1) * Number(limit));

    let attempts = await attemptsQuery.exec();
    let total = await QuizAttempt.countDocuments(query);

    // In-memory search filter (if search param provided)
    if (search) {
      const searchLower = search.toLowerCase();
      attempts = attempts.filter(a =>
        (a.userId?.fullName && a.userId.fullName.toLowerCase().includes(searchLower)) ||
        (a.userId?.email && a.userId.email.toLowerCase().includes(searchLower)) ||
        (a.quizId?.quizTitle && a.quizId.quizTitle.toLowerCase().includes(searchLower))
      );
      total = attempts.length;
    }

    // Stats (basic)
    const statsAgg = await QuizAttempt.aggregate([
      { $match: query },
      {
        $group: {
          _id: null,
          avgScore: { $avg: '$totalScore' },
          avgPercentage: { $avg: '$percentage' },
          maxScore: { $max: '$totalScore' },
          minScore: { $min: '$totalScore' },
          totalAttempts: { $sum: 1 },
          passedAttempts: { $sum: { $cond: [{ $gte: ['$percentage', 50] }, 1, 0] } },
          avgTimeTaken: { $avg: '$timeTaken' }
        }
      }
    ]);

    res.json({
      attempts,
      totalPages: Math.ceil(total / limit),
      currentPage: Number(page),
      total,
      stats: statsAgg[0] || {}
    });
  } catch (error) {
    console.error('Get all attempts (admin) error:', error);
    res.status(500).json({ message: 'Failed to fetch attempts' });
  }
};

module.exports = {
  startAttempt,
  saveAnswer,
  submitAttempt,
  getAttemptDetails,
  getUserAttempts,
  getAttemptsByQuiz,
  getAttemptResult,
  getAllAttempts
};
