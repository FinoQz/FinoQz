const Transaction = require('../models/Transaction');
const Quiz = require('../models/Quiz');
const Wallet = require('../models/Wallet');
const mongoose = require('mongoose');

/**
 * Initiate payment
 * @route POST /api/transactions/initiate
 */
const initiatePayment = async (req, res) => {
  try {
    const { quizId, amount, paymentMethod } = req.body;
    const userId = req.user._id;

    if (!quizId || !amount || !paymentMethod) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Verify quiz exists
    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    // For wallet payment, check balance
    if (paymentMethod === 'wallet') {
      const wallet = await Wallet.findOne({ userId });
      if (!wallet || wallet.balance < amount) {
        return res.status(400).json({ message: 'Insufficient wallet balance' });
      }
    }

    // Create transaction
    const transaction = await Transaction.create({
      userId,
      quizId,
      amount,
      paymentMethod,
      status: 'pending'
    });

    // If wallet payment, process immediately
    if (paymentMethod === 'wallet') {
      const wallet = await Wallet.findOne({ userId });
      wallet.balance -= amount;
      wallet.transactions.push({
        type: 'debit',
        amount,
        reason: `Payment for quiz: ${quiz.quizTitle}`,
        referenceId: transaction._id,
        timestamp: new Date()
      });
      await wallet.save();

      transaction.status = 'success';
      transaction.completedAt = new Date();
      await transaction.save();

      return res.json({
        message: 'Payment successful',
        transaction,
        paymentMethod: 'wallet'
      });
    }

    // For Razorpay/Stripe, return order details
    // This would integrate with actual payment gateway
    const orderData = {
      transactionId: transaction._id,
      amount: amount * 100, // Convert to paise/cents
      currency: transaction.currency,
      // Add gateway-specific order ID here
    };

    res.json({
      message: 'Payment initiated',
      transaction: transaction._id,
      orderData
    });
  } catch (error) {
    console.error('Initiate payment error:', error);
    res.status(500).json({ message: 'Failed to initiate payment' });
  }
};

/**
 * Verify payment callback
 * @route POST /api/transactions/verify
 */
const verifyPayment = async (req, res) => {
  try {
    const { transactionId, gatewayTransactionId, gatewayResponse } = req.body;

    if (!transactionId) {
      return res.status(400).json({ message: 'Transaction ID required' });
    }

    const transaction = await Transaction.findById(transactionId);
    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    // Here you would verify the payment with the gateway
    // For now, we'll mark it as success
    transaction.status = 'success';
    transaction.gatewayTransactionId = gatewayTransactionId;
    transaction.gatewayResponse = gatewayResponse || {};
    transaction.completedAt = new Date();

    await transaction.save();

    res.json({
      message: 'Payment verified successfully',
      transaction
    });
  } catch (error) {
    console.error('Verify payment error:', error);
    res.status(500).json({ message: 'Failed to verify payment' });
  }
};

/**
 * Get transaction history for a user
 * @route GET /api/transactions/history
 */
const getTransactionHistory = async (req, res) => {
  try {
    const userId = req.user._id;
    const { page = 1, limit = 20, status } = req.query;

    const query = { userId };
    if (status) {
      query.status = status;
    }

    const transactions = await Transaction.find(query)
      .populate('quizId', 'quizTitle category')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await Transaction.countDocuments(query);

    res.json({
      transactions,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: count
    });
  } catch (error) {
    console.error('Get transaction history error:', error);
    res.status(500).json({ message: 'Failed to fetch transaction history' });
  }
};

/**
 * Get all transactions (Admin only)
 * @route GET /api/transactions/all
 */
const getAllTransactions = async (req, res) => {
  try {
    const { page = 1, limit = 20, status, method, dateRange } = req.query;

    const query = {};
    if (status) {
      query.status = status;
    }
    if (method) {
      query.paymentMethod = method;
    }

    // Add date range filter
    if (dateRange) {
      const [startDate, endDate] = dateRange.split(',');
      query.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const transactions = await Transaction.find(query)
      .populate('userId', 'fullName email')
      .populate('quizId', 'quizTitle category')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await Transaction.countDocuments(query);

    // Calculate summary stats
    const stats = await Transaction.aggregate([
      { $match: query },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: { $cond: [{ $eq: ['$status', 'success'] }, '$amount', 0] } },
          successfulTransactions: { $sum: { $cond: [{ $eq: ['$status', 'success'] }, 1, 0] } },
          failedTransactions: { $sum: { $cond: [{ $eq: ['$status', 'failed'] }, 1, 0] } },
          pendingTransactions: { $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] } }
        }
      }
    ]);

    res.json({
      transactions,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: count,
      stats: stats[0] || {}
    });
  } catch (error) {
    console.error('Get all transactions error:', error);
    res.status(500).json({ message: 'Failed to fetch transactions' });
  }
};

/**
 * Process refund
 * @route POST /api/transactions/:transactionId/refund
 */
const processRefund = async (req, res) => {
  try {
    const { transactionId } = req.params;
    const { reason } = req.body;

    const transaction = await Transaction.findById(transactionId);
    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    if (transaction.status !== 'success') {
      return res.status(400).json({ message: 'Only successful transactions can be refunded' });
    }

    // Process refund based on payment method
    if (transaction.paymentMethod === 'wallet') {
      const wallet = await Wallet.findOne({ userId: transaction.userId });
      if (wallet) {
        wallet.balance += transaction.amount;
        wallet.transactions.push({
          type: 'credit',
          amount: transaction.amount,
          reason: `Refund: ${reason || 'Transaction refund'}`,
          referenceId: transaction._id,
          timestamp: new Date()
        });
        await wallet.save();
      }
    }

    transaction.status = 'refunded';
    transaction.metadata = { 
      ...transaction.metadata, 
      refundReason: reason,
      refundedAt: new Date()
    };
    await transaction.save();

    res.json({
      message: 'Refund processed successfully',
      transaction
    });
  } catch (error) {
    console.error('Process refund error:', error);
    res.status(500).json({ message: 'Failed to process refund' });
  }
};

/**
 * Get revenue statistics
 * @route GET /api/transactions/revenue-stats
 */
const getRevenueStats = async (req, res) => {
  try {
    const { dateRange = '30' } = req.query;
    const days = parseInt(dateRange);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const stats = await Transaction.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalAmount: { $sum: '$amount' }
        }
      }
    ]);

    // Method breakdown
    const methodStats = await Transaction.aggregate([
      {
        $match: {
          status: 'success',
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: '$paymentMethod',
          count: { $sum: 1 },
          totalAmount: { $sum: '$amount' }
        }
      }
    ]);

    res.json({
      statusBreakdown: stats,
      methodBreakdown: methodStats
    });
  } catch (error) {
    console.error('Get revenue stats error:', error);
    res.status(500).json({ message: 'Failed to fetch revenue statistics' });
  }
};

module.exports = {
  initiatePayment,
  verifyPayment,
  getTransactionHistory,
  getAllTransactions,
  processRefund,
  getRevenueStats
};
