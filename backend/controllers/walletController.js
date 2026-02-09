const Wallet = require('../models/Wallet');
const Transaction = require('../models/Transaction');

/**
 * Get user wallet balance
 * @route GET /api/wallet/balance
 */
const getWalletBalance = async (req, res) => {
  try {
    const userId = req.userId || req.user?._id || req.user?.id || req.user?.userId;
    if (!userId) {
      return res.status(401).json({ message: 'No user context found' });
    }

    let wallet = await Wallet.findOne({ userId });
    
    // Create wallet if it doesn't exist
    if (!wallet) {
      wallet = await Wallet.create({ userId, balance: 0 });
    }

    res.json({
      balance: wallet.balance,
      updatedAt: wallet.updatedAt
    });
  } catch (error) {
    console.error('Get wallet balance error:', error);
    res.status(500).json({ message: 'Failed to fetch wallet balance' });
  }
};

/**
 * Add funds to wallet
 * @route POST /api/wallet/add-funds
 */
const addFunds = async (req, res) => {
  try {
    const { amount, reason, referenceId } = req.body;
    const userId = req.userId || req.user?._id || req.user?.id || req.user?.userId;
    if (!userId) {
      return res.status(401).json({ message: 'No user context found' });
    }

    if (!amount || amount <= 0) {
      return res.status(400).json({ message: 'Invalid amount' });
    }

    let wallet = await Wallet.findOne({ userId });
    
    if (!wallet) {
      wallet = await Wallet.create({ userId, balance: 0 });
    }

    // Add funds
    wallet.balance += amount;
    wallet.transactions.push({
      type: 'credit',
      amount,
      reason: reason || 'Funds added',
      referenceId,
      timestamp: new Date()
    });

    await wallet.save();

    res.json({
      message: 'Funds added successfully',
      balance: wallet.balance,
      transaction: wallet.transactions[wallet.transactions.length - 1]
    });
  } catch (error) {
    console.error('Add funds error:', error);
    res.status(500).json({ message: 'Failed to add funds' });
  }
};

/**
 * Deduct funds from wallet
 * @route POST /api/wallet/deduct-funds
 */
const deductFunds = async (req, res) => {
  try {
    const { amount, reason, referenceId } = req.body;
    const userId = req.userId || req.user?._id || req.user?.id || req.user?.userId;
    if (!userId) {
      return res.status(401).json({ message: 'No user context found' });
    }

    if (!amount || amount <= 0) {
      return res.status(400).json({ message: 'Invalid amount' });
    }

    const wallet = await Wallet.findOne({ userId });
    
    if (!wallet) {
      return res.status(404).json({ message: 'Wallet not found' });
    }

    if (wallet.balance < amount) {
      return res.status(400).json({ message: 'Insufficient balance' });
    }

    // Deduct funds
    wallet.balance -= amount;
    wallet.transactions.push({
      type: 'debit',
      amount,
      reason: reason || 'Funds deducted',
      referenceId,
      timestamp: new Date()
    });

    await wallet.save();

    res.json({
      message: 'Funds deducted successfully',
      balance: wallet.balance,
      transaction: wallet.transactions[wallet.transactions.length - 1]
    });
  } catch (error) {
    console.error('Deduct funds error:', error);
    res.status(500).json({ message: 'Failed to deduct funds' });
  }
};

/**
 * Get wallet transaction history
 * @route GET /api/wallet/transactions
 */
const getWalletTransactions = async (req, res) => {
  try {
    const userId = req.userId || req.user?._id || req.user?.id || req.user?.userId;
    if (!userId) {
      return res.status(401).json({ message: 'No user context found' });
    }
    const { page = 1, limit = 20, type } = req.query;

    const wallet = await Wallet.findOne({ userId });
    
    if (!wallet) {
      return res.json({
        transactions: [],
        totalPages: 0,
        currentPage: page,
        total: 0
      });
    }

    let transactions = wallet.transactions;

    // Filter by type if specified
    if (type) {
      transactions = transactions.filter(t => t.type === type);
    }

    // Sort by timestamp descending
    transactions.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const paginatedTransactions = transactions.slice(startIndex, endIndex);

    res.json({
      transactions: paginatedTransactions,
      totalPages: Math.ceil(transactions.length / limit),
      currentPage: page,
      total: transactions.length,
      balance: wallet.balance
    });
  } catch (error) {
    console.error('Get wallet transactions error:', error);
    res.status(500).json({ message: 'Failed to fetch transactions' });
  }
};

module.exports = {
  getWalletBalance,
  addFunds,
  deductFunds,
  getWalletTransactions
};
