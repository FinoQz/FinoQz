const express = require('express');
const router = express.Router();
const {
  getWalletBalance,
  addFunds,
  deductFunds,
  getWalletTransactions
} = require('../controllers/walletController');
const { celebrate, Joi, Segments } = require('celebrate');
const verifyToken = require('../middlewares/verifyToken');

// Get wallet balance
router.get('/balance', verifyToken(), getWalletBalance);

// Add funds to wallet
router.post('/add-funds',
  verifyToken,
  celebrate({
    [Segments.BODY]: Joi.object({
      amount: Joi.number().positive().required(),
      reason: Joi.string().optional(),
      referenceId: Joi.string().optional()
    })
  }),
  addFunds
);

// Deduct funds from wallet
router.post('/deduct-funds',
  verifyToken,
  celebrate({
    [Segments.BODY]: Joi.object({
      amount: Joi.number().positive().required(),
      reason: Joi.string().required(),
      referenceId: Joi.string().optional()
    })
  }),
  deductFunds
);

// Get wallet transactions
router.get('/transactions', verifyToken(), getWalletTransactions);

module.exports = router;
