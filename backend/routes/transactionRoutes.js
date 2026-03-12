
import express from 'express';
import {
  initiatePayment,
  verifyPayment,
  getTransactionHistory,
  getAllTransactions,
  processRefund,
  getRevenueStats
} from '../controllers/transactionController.js';
import { celebrate, Joi, Segments } from 'celebrate';
import verifyToken from '../middlewares/verifyToken.js';
import requireAdmin from '../middlewares/requireAdmin.js';

const router = express.Router();

// Initiate payment
router.post('/initiate',
  verifyToken(),
  celebrate({
    [Segments.BODY]: Joi.object({
      quizId: Joi.string().required(),
      amount: Joi.number().positive().required(),
      paymentMethod: Joi.string().valid('razorpay', 'stripe', 'offline', 'wallet', 'cashfree', 'phonepe').required()
    })
  }),
  initiatePayment
);

// Verify payment
router.post('/verify',
  verifyToken(),
  celebrate({
    [Segments.BODY]: Joi.object({
      transactionId: Joi.string().optional(),
      orderId: Joi.string().optional(),
      gatewayTransactionId: Joi.string().optional(),
      gatewayResponse: Joi.object().optional()
    }).or('transactionId', 'orderId')
  }),
  verifyPayment
);

// Get user transaction history
router.get('/history', verifyToken(), getTransactionHistory);

// Get all transactions (Admin only)
router.get('/all', verifyToken(), requireAdmin, getAllTransactions);

// Process refund (Admin only)
router.post('/:transactionId/refund',
  verifyToken(),
  requireAdmin,
  celebrate({
    [Segments.PARAMS]: Joi.object({
      transactionId: Joi.string().required()
    }),
    [Segments.BODY]: Joi.object({
      reason: Joi.string().optional()
    })
  }),
  processRefund
);

// Get revenue statistics (Admin only)
router.get('/revenue-stats', verifyToken(), requireAdmin, getRevenueStats);

export default router;
