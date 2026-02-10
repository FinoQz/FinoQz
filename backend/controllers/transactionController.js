const Transaction = require('../models/Transaction');
const Quiz = require('../models/Quiz');
const Wallet = require('../models/Wallet');
const User = require('../models/User');
const mongoose = require('mongoose');
const axios = require('axios');

const getRequestUserId = (req) => {
  return req.userId || req.user?._id || req.user?.id || req.user?.userId || null;
};

const getCashfreeBaseUrl = () => {
  if (process.env.CASHFREE_API_BASE) return process.env.CASHFREE_API_BASE;
  const env = (process.env.CASHFREE_ENV || 'sandbox').toLowerCase();
  return env === 'production'
    ? 'https://api.cashfree.com/pg'
    : 'https://sandbox.cashfree.com/pg';
};

const getCashfreeCheckoutUrl = (paymentSessionId) => {
  if (process.env.CASHFREE_CHECKOUT_URL) {
    return `${process.env.CASHFREE_CHECKOUT_URL}?payment_session_id=${paymentSessionId}`;
  }
  const env = (process.env.CASHFREE_ENV || 'sandbox').toLowerCase();
  const base = env === 'production'
    ? 'https://payments.cashfree.com/orders/sessions'
    : 'https://sandbox.cashfree.com/pg/orders/sessions';
  return `${base}?payment_session_id=${paymentSessionId}`;
};

/**
 * Initiate payment
 * @route POST /api/transactions/initiate
 */
const initiatePayment = async (req, res) => {
  try {
    const { quizId, amount, paymentMethod } = req.body;
    const userId = getRequestUserId(req);
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

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

    // Cashfree order creation
    if (paymentMethod === 'cashfree') {
      const clientId = process.env.CASHFREE_CLIENT_ID;
      const clientSecret = process.env.CASHFREE_CLIENT_SECRET;
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';

      if (!clientId || !clientSecret) {
        return res.status(500).json({ message: 'Cashfree keys not configured' });
      }

      const user = await User.findById(userId).select('fullName email mobile').lean();
      const cashfreeBaseUrl = getCashfreeBaseUrl();

      const orderPayload = {
        order_id: String(transaction._id),
        order_amount: amount,
        order_currency: transaction.currency,
        customer_details: {
          customer_id: String(userId),
          customer_name: user?.fullName || 'User',
          customer_email: user?.email || 'unknown@example.com',
          customer_phone: user?.mobile || '9999999999'
        },
        order_meta: {
          return_url: `${frontendUrl}/user_dash/payment/cashfree?quizId=${quizId}`
        }
      };

      const orderResponse = await axios.post(`${cashfreeBaseUrl}/orders`, orderPayload, {
        headers: {
          'x-client-id': clientId,
          'x-client-secret': clientSecret,
          'x-api-version': '2023-08-01',
          'Content-Type': 'application/json'
        }
      });

      const paymentSessionId = orderResponse.data?.payment_session_id;
      const checkoutUrl = paymentSessionId ? getCashfreeCheckoutUrl(paymentSessionId) : null;
      transaction.metadata = {
        ...(transaction.metadata || {}),
        cashfreeOrderId: orderResponse.data?.order_id,
        paymentSessionId
      };
      await transaction.save();

      return res.json({
        message: 'Payment initiated',
        transaction: transaction._id,
        orderData: {
          orderId: orderResponse.data?.order_id,
          paymentSessionId,
          checkoutUrl
        }
      });
    }

    // For Stripe/offline, return transaction details
    res.json({
      message: 'Payment initiated',
      transaction: transaction._id
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
    const { transactionId, orderId, gatewayTransactionId, gatewayResponse } = req.body;
    const resolvedId = transactionId || orderId;

    if (!resolvedId) {
      return res.status(400).json({ message: 'Transaction ID required' });
    }

    const transaction = await Transaction.findById(resolvedId);
    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    const paymentMethod = transaction.paymentMethod;

    if (paymentMethod === 'cashfree') {
      const clientId = process.env.CASHFREE_CLIENT_ID;
      const clientSecret = process.env.CASHFREE_CLIENT_SECRET;
      const cashfreeBaseUrl = getCashfreeBaseUrl();

      if (!clientId || !clientSecret) {
        return res.status(500).json({ message: 'Cashfree keys not configured' });
      }

      const orderIdToCheck = transaction.metadata?.cashfreeOrderId || resolvedId;
      const orderResponse = await axios.get(`${cashfreeBaseUrl}/orders/${orderIdToCheck}`, {
        headers: {
          'x-client-id': clientId,
          'x-client-secret': clientSecret,
          'x-api-version': '2023-08-01'
        }
      });

      const orderStatus = orderResponse.data?.order_status;
      if (orderStatus !== 'PAID') {
        transaction.status = orderStatus === 'ACTIVE' ? 'pending' : 'failed';
        transaction.gatewayResponse = orderResponse.data || {};
        await transaction.save();
        return res.status(400).json({ message: 'Payment not completed' });
      }

      transaction.status = 'success';
      transaction.gatewayTransactionId = orderResponse.data?.cf_payment_id || gatewayTransactionId;
      transaction.gatewayResponse = {
        ...(gatewayResponse || {}),
        orderStatus,
        cashfree: orderResponse.data || {}
      };
      transaction.completedAt = new Date();
      await transaction.save();
    } else if (paymentMethod === 'wallet' || paymentMethod === 'offline') {
      transaction.status = 'success';
      transaction.gatewayTransactionId = gatewayTransactionId || transaction.gatewayTransactionId;
      transaction.gatewayResponse = gatewayResponse || {};
      transaction.completedAt = new Date();
      await transaction.save();
    } else {
      return res.status(400).json({ message: 'Unsupported payment method verification' });
    }

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
    const userId = getRequestUserId(req);
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
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
      const trimmedRange = String(dateRange).trim();
      let startDate;
      let endDate;

      if (/^\d+$/.test(trimmedRange)) {
        const days = Number(trimmedRange);
        endDate = new Date();
        startDate = new Date();
        startDate.setDate(endDate.getDate() - days);
      } else {
        const [startRaw, endRaw] = trimmedRange.split(',');
        startDate = new Date(startRaw);
        endDate = new Date(endRaw);
      }

      if (!Number.isNaN(startDate?.valueOf()) && !Number.isNaN(endDate?.valueOf())) {
        query.createdAt = {
          $gte: startDate,
          $lte: endDate
        };
      }
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
