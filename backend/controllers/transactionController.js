import Transaction from '../models/Transaction.js';
import Quiz from '../models/Quiz.js';
import Wallet from '../models/Wallet.js';
import User from '../models/User.js';
import mongoose from 'mongoose';
import { StandardCheckoutClient, Env, StandardCheckoutPayRequest } from 'pg-sdk-node';
import { v4 as uuid } from 'uuid';

const getRequestUserId = (req) => {
  // Ensure strict scoping: regular users CANNOT override their identity via query params.
  const isAdmin = req.role === 'admin' || req.user?.role === 'admin' || (req.adminId && !req.userId);
  if (isAdmin && req.query.userId && mongoose.Types.ObjectId.isValid(req.query.userId)) {
    return req.query.userId;
  }
  return req.userId || req.user?._id || req.user?.id || req.user?.userId || null;
};

/**
 * Initiate payment (PhonePe or Wallet)
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

    // Create transaction
    const transaction = await Transaction.create({
      userId,
      quizId,
      amount,
      paymentMethod,
      status: 'pending'
    });

    // PhonePe payment
    if (paymentMethod === 'phonepe') {
      const clientId = process.env.PHONEPE_MERCHANT_ID;
      const clientSecret = process.env.PHONEPE_MERCHANT_KEY;
      const clientVersion = process.env.PHONEPE_CLIENT_VERSION || '2024-01-01';
      const env = (process.env.PHONEPE_ENV || 'sandbox').toLowerCase() === 'production' ? Env.PRODUCTION : Env.SANDBOX;

      if (!clientId || !clientSecret || !clientVersion) {
        return res.status(500).json({ message: 'PhonePe keys/config missing' });
      }

      const client = StandardCheckoutClient.getInstance(clientId, clientSecret, clientVersion, env);

      const merchantOrderId = transaction._id.toString();
      const redirectUrl = `${process.env.FRONTEND_URL}/user_dash/payment/phonepe?quizId=${quizId}&transactionId=${transaction._id}`;

      // Amount in paise (₹1 = 100)
      const request = StandardCheckoutPayRequest.builder()
        .merchantOrderId(merchantOrderId)
        .amount(amount * 100)
        .redirectUrl(redirectUrl)
        .build();

      // Initiate payment
      const response = await client.pay(request);
      const checkoutPageUrl = response.redirectUrl;

      // Save PhonePe info in transaction
      transaction.metadata = {
        ...(transaction.metadata || {}),
        phonepeOrderId: merchantOrderId,
        phonepeCheckoutUrl: checkoutPageUrl
      };
      await transaction.save();

      return res.json({
        message: 'Payment initiated',
        transaction: transaction._id,
        orderData: {
          orderId: merchantOrderId,
          checkoutPageUrl
        }
      });
    }

    // For wallet payment, check balance
    if (paymentMethod === 'wallet') {
      const wallet = await Wallet.findOne({ userId });
      if (!wallet || wallet.balance < amount) {
        return res.status(400).json({ message: 'Insufficient wallet balance' });
      }
      // Wallet deduction logic yahan add karo if needed
    }

    res.json({
      message: 'Payment initiated',
      transaction: transaction._id
    });
  } catch (error) {
    console.error('Initiate payment error:', error);
    res.status(500).json({ message: 'Failed to initiate payment', error: error.message });
  }
};

/**
 * Verify payment callback (PhonePe)
 * @route POST /api/transactions/verify
 */
const verifyPayment = async (req, res) => {
  try {
    const { transactionId } = req.body;
    if (!transactionId) {
      return res.status(400).json({ message: 'Transaction ID required' });
    }

    const transaction = await Transaction.findById(transactionId);
    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    if (transaction.paymentMethod === 'phonepe') {
      const clientId = process.env.PHONEPE_MERCHANT_ID;
      const clientSecret = process.env.PHONEPE_MERCHANT_KEY;
      const clientVersion = process.env.PHONEPE_CLIENT_VERSION || '2024-01-01';
      const env = (process.env.PHONEPE_ENV || 'sandbox').toLowerCase() === 'production' ? Env.PRODUCTION : Env.SANDBOX;

      const client = StandardCheckoutClient.getInstance(clientId, clientSecret, clientVersion, env);

      const merchantOrderId = transaction.metadata?.phonepeOrderId || transaction._id.toString();

      const response = await client.getOrderStatus(merchantOrderId);
      const state = response.state;

      if (state !== 'COMPLETED') {
        transaction.status = state === 'PENDING' ? 'pending' : 'failed';
        transaction.gatewayResponse = response;
        await transaction.save();
        return res.status(400).json({ message: 'Payment not completed', state });
      }

      transaction.status = 'success';
      transaction.gatewayTransactionId = response.transactionId;
      transaction.gatewayResponse = response;
      transaction.completedAt = new Date();
      await transaction.save();

      return res.json({
        message: 'Payment verified successfully',
        transaction
      });
    }

    // For wallet/offline/stripe, return transaction details
    res.json({
      message: 'Payment verified successfully',
      transaction: transaction._id
    });
  } catch (error) {
    console.error('Verify payment error:', error);
    res.status(500).json({ message: 'Failed to verify payment', error: error.message });
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
    res.json({ transactions });
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
    res.json({ transactions });
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
      transaction: transaction._id
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
      { $match: { status: 'success' } },
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

export {
  initiatePayment,
  verifyPayment,
  getTransactionHistory,
  getAllTransactions,
  processRefund,
  getRevenueStats
};
