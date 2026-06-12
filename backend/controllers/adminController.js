const User = require('../models/User');
const Stock = require('../models/Stock');
const Transaction = require('../models/Transaction');

// @desc    Get all users (Admin only)
// @route   GET /api/admin/users
// @access  Private/Admin
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}).select('-password');
    res.json({ success: true, count: users.length, data: users });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Adjust user balance (Admin only)
// @route   PUT /api/admin/users/:id/balance
// @access  Private/Admin
const adjustUserBalance = async (req, res) => {
  try {
    const { balance } = req.body;
    const newBalance = parseFloat(balance);

    if (isNaN(newBalance) || newBalance < 0) {
      return res.status(400).json({ success: false, message: 'Please provide a valid non-negative balance' });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.balance = newBalance;
    await user.save();

    res.json({ success: true, message: `Successfully adjusted ${user.username}'s balance to $${user.balance.toFixed(2)}`, data: user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create new stock (Admin only)
// @route   POST /api/admin/stocks
// @access  Private/Admin
const createStock = async (req, res) => {
  try {
    const { symbol, name, price, sector, description } = req.body;
    const stockPrice = parseFloat(price);

    if (!symbol || !name || isNaN(stockPrice) || stockPrice <= 0) {
      return res.status(400).json({ success: false, message: 'Please provide valid stock details and a positive price' });
    }

    // Check if stock exists
    const stockExists = await Stock.findOne({ symbol: symbol.toUpperCase() });
    if (stockExists) {
      return res.status(400).json({ success: false, message: `Stock with symbol ${symbol.toUpperCase()} already exists` });
    }

    // Create stock with initial history point
    const stock = await Stock.create({
      symbol: symbol.toUpperCase(),
      name,
      price: stockPrice,
      prevClose: stockPrice,
      high: stockPrice,
      low: stockPrice,
      sector: sector || 'General',
      description: description || '',
      history: [{ price: stockPrice, timestamp: new Date() }],
    });

    res.status(201).json({ success: true, message: `Created stock ${stock.symbol}`, data: stock });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update stock listing (Admin only)
// @route   PUT /api/admin/stocks/:id
// @access  Private/Admin
const updateStock = async (req, res) => {
  try {
    const { name, price, sector, description } = req.body;
    const stock = await Stock.findById(req.params.id);

    if (!stock) {
      return res.status(404).json({ success: false, message: 'Stock not found' });
    }

    if (name) stock.name = name;
    if (sector) stock.sector = sector;
    if (description) stock.description = description;
    
    if (price !== undefined) {
      const stockPrice = parseFloat(price);
      if (isNaN(stockPrice) || stockPrice <= 0) {
        return res.status(400).json({ success: false, message: 'Please provide a positive price' });
      }
      stock.price = stockPrice;
      // Also record history change
      stock.history.push({ price: stockPrice, timestamp: new Date() });
      if (stock.history.length > 50) stock.history.shift();
    }

    await stock.save();
    res.json({ success: true, message: `Updated stock ${stock.symbol}`, data: stock });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete stock listing (Admin only)
// @route   DELETE /api/admin/stocks/:id
// @access  Private/Admin
const deleteStock = async (req, res) => {
  try {
    const stock = await Stock.findById(req.params.id);
    if (!stock) {
      return res.status(404).json({ success: false, message: 'Stock not found' });
    }

    await stock.deleteOne();
    res.json({ success: true, message: `Deleted stock ${stock.symbol}` });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get platform stats (Admin only)
// @route   GET /api/admin/stats
// @access  Private/Admin
const getPlatformStats = async (req, res) => {
  try {
    // 1. Transaction volume and count
    const transactions = await Transaction.find({});
    const totalTransactions = transactions.length;
    const totalTradeVolume = transactions.reduce((acc, t) => acc + t.totalAmount, 0);

    // 2. Active users count
    const totalUsers = await User.countDocuments({ role: 'USER' });
    const totalAdmins = await User.countDocuments({ role: 'ADMIN' });

    // 3. Overall cash pool in system
    const users = await User.find({});
    const totalSystemCash = users.reduce((acc, u) => acc + u.balance, 0);

    // 4. Most active stocks by transaction volume
    const stockCounts = {};
    transactions.forEach((t) => {
      stockCounts[t.symbol] = (stockCounts[t.symbol] || 0) + t.quantity;
    });
    const popularStock = Object.entries(stockCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([symbol, volume]) => ({ symbol, volume }));

    res.json({
      success: true,
      data: {
        totalTransactions,
        totalTradeVolume,
        userCount: totalUsers,
        adminCount: totalAdmins,
        totalSystemCash,
        popularStocks: popularStock,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getAllUsers,
  adjustUserBalance,
  createStock,
  updateStock,
  deleteStock,
  getPlatformStats,
};
