import express from 'express';
import {
  getWalletBalance,
  addFunds,
  deductFunds,
  getWalletTransactions
} from '../controllers/walletController.js';
import { getAllWalletBalances } from '../controllers/walletController.js';
import { celebrate, Joi, Segments } from 'celebrate';
import verifyToken from '../middlewares/verifyToken.js';
import requireAdmin from '../middlewares/requireAdmin.js';

const router = express.Router();

// Get wallet balance
router.get('/balance', verifyToken(), getWalletBalance);

// Add funds to wallet
router.post('/add-funds',
  verifyToken(),
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
  verifyToken(),
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
// Get all users' wallet balances (Admin only)
router.get('/all-balances', verifyToken(), requireAdmin, getAllWalletBalances);

export default router;
