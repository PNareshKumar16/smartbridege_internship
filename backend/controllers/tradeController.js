const User = require('../models/User');
const Stock = require('../models/Stock');
const Transaction = require('../models/Transaction');
const Portfolio = require('../models/Portfolio');

// @desc    Buy stock
// @route   POST /api/trade/buy
// @access  Private
const buyStock = async (req, res) => {
  try {
    const { symbol, quantity } = req.body;
    const qty = parseInt(quantity, 10);

    if (!symbol || isNaN(qty) || qty <= 0) {
      return res.status(400).json({ success: false, message: 'Please provide a valid stock symbol and positive quantity' });
    }

    // Find stock
    const stock = await Stock.findOne({ symbol: symbol.toUpperCase() });
    if (!stock) {
      return res.status(404).json({ success: false, message: 'Stock not found' });
    }

    const currentPrice = stock.price;
    const totalAmount = currentPrice * qty;

    // Find user
    const user = await User.findById(req.user._id);
    if (user.balance < totalAmount) {
      return res.status(400).json({ success: false, message: `Insufficient balance. Required: $${totalAmount.toFixed(2)}, Available: $${user.balance.toFixed(2)}` });
    }

    // Deduct user balance
    user.balance -= totalAmount;
    await user.save();

    // Create transaction log
    const transaction = await Transaction.create({
      user: user._id,
      stock: stock._id,
      symbol: stock.symbol,
      type: 'BUY',
      quantity: qty,
      price: currentPrice,
      totalAmount,
    });

    // Update user portfolio
    let portfolio = await Portfolio.findOne({ user: user._id });
    if (!portfolio) {
      portfolio = new Portfolio({ user: user._id, holdings: [] });
    }

    const holdingIndex = portfolio.holdings.findIndex(
      (h) => h.symbol === stock.symbol
    );

    if (holdingIndex > -1) {
      // User already holds this stock, update average price and quantity
      const holding = portfolio.holdings[holdingIndex];
      const newQuantity = holding.quantity + qty;
      const newTotalCost = holding.totalCost + totalAmount;
      const newAverageBuyPrice = newTotalCost / newQuantity;

      holding.quantity = newQuantity;
      holding.totalCost = newTotalCost;
      holding.averageBuyPrice = newAverageBuyPrice;
    } else {
      // Add new holding
      portfolio.holdings.push({
        stock: stock._id,
        symbol: stock.symbol,
        quantity: qty,
        averageBuyPrice: currentPrice,
        totalCost: totalAmount,
      });
    }

    await portfolio.save();

    res.json({
      success: true,
      message: `Successfully bought ${qty} shares of ${stock.symbol}`,
      balance: user.balance,
      transaction,
      portfolio: portfolio.holdings,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Sell stock
// @route   POST /api/trade/sell
// @access  Private
const sellStock = async (req, res) => {
  try {
    const { symbol, quantity } = req.body;
    const qty = parseInt(quantity, 10);

    if (!symbol || isNaN(qty) || qty <= 0) {
      return res.status(400).json({ success: false, message: 'Please provide a valid stock symbol and positive quantity' });
    }

    // Find stock
    const stock = await Stock.findOne({ symbol: symbol.toUpperCase() });
    if (!stock) {
      return res.status(404).json({ success: false, message: 'Stock not found' });
    }

    const currentPrice = stock.price;
    const totalAmount = currentPrice * qty;

    // Find user's portfolio
    const portfolio = await Portfolio.findOne({ user: req.user._id });
    if (!portfolio) {
      return res.status(400).json({ success: false, message: 'You do not own any stocks' });
    }

    const holdingIndex = portfolio.holdings.findIndex(
      (h) => h.symbol === stock.symbol
    );

    if (holdingIndex === -1 || portfolio.holdings[holdingIndex].quantity < qty) {
      const ownedQty = holdingIndex === -1 ? 0 : portfolio.holdings[holdingIndex].quantity;
      return res.status(400).json({ success: false, message: `Insufficient holdings. You own ${ownedQty} shares of ${stock.symbol}, but tried to sell ${qty}` });
    }

    // Find user
    const user = await User.findById(req.user._id);

    // Add totalAmount to user balance
    user.balance += totalAmount;
    await user.save();

    // Create transaction log
    const transaction = await Transaction.create({
      user: user._id,
      stock: stock._id,
      symbol: stock.symbol,
      type: 'SELL',
      quantity: qty,
      price: currentPrice,
      totalAmount,
    });

    // Update holdings
    const holding = portfolio.holdings[holdingIndex];
    holding.quantity -= qty;
    holding.totalCost = holding.averageBuyPrice * holding.quantity;

    if (holding.quantity === 0) {
      // Remove holding if quantity is 0
      portfolio.holdings.splice(holdingIndex, 1);
    }

    await portfolio.save();

    res.json({
      success: true,
      message: `Successfully sold ${qty} shares of ${stock.symbol}`,
      balance: user.balance,
      transaction,
      portfolio: portfolio.holdings,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  buyStock,
  sellStock,
};
