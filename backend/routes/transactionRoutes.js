const express = require('express');
const router = express.Router();
const {
  initiatePayment,
  verifyPayment,
  getTransactionHistory,
  getAllTransactions,
  processRefund,
  getRevenueStats
} = require('../controllers/transactionController');
const { celebrate, Joi, Segments } = require('celebrate');
const verifyToken = require('../middlewares/verifyToken');
const verifyAdmin = require('../middlewares/verifyAdmin');

// Initiate payment
router.post('/initiate',
  verifyToken,
  celebrate({
    [Segments.BODY]: Joi.object({
      quizId: Joi.string().required(),
      amount: Joi.number().positive().required(),
      paymentMethod: Joi.string().valid('razorpay', 'stripe', 'offline', 'wallet').required()
    })
  }),
  initiatePayment
);

// Verify payment
router.post('/verify',
  verifyToken,
  celebrate({
    [Segments.BODY]: Joi.object({
      transactionId: Joi.string().required(),
      gatewayTransactionId: Joi.string().optional(),
      gatewayResponse: Joi.object().optional()
    })
  }),
  verifyPayment
);

// Get user transaction history
router.get('/history', verifyToken, getTransactionHistory);

// Get all transactions (Admin only)
router.get('/all', verifyToken, verifyAdmin, getAllTransactions);

// Process refund (Admin only)
router.post('/:transactionId/refund',
  verifyToken,
  verifyAdmin,
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
router.get('/revenue-stats', verifyToken, verifyAdmin, getRevenueStats);

module.exports = router;
