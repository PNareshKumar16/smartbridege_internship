const Portfolio = require('../models/Portfolio');
const Stock = require('../models/Stock');
const Transaction = require('../models/Transaction');
const User = require('../models/User');

// @desc    Get user portfolio holdings and performance metrics
// @route   GET /api/portfolio
// @access  Private
const getPortfolio = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    let portfolio = await Portfolio.findOne({ user: req.user._id }).populate({
      path: 'holdings.stock',
      select: 'price name prevClose sector',
    });

    if (!portfolio) {
      portfolio = await Portfolio.create({ user: req.user._id, holdings: [] });
    }

    let totalHoldingsCost = 0;
    let totalHoldingsValue = 0;

    const detailedHoldings = portfolio.holdings.map((holding) => {
      const currentPrice = holding.stock ? holding.stock.price : holding.averageBuyPrice;
      const stockName = holding.stock ? holding.stock.name : holding.symbol;
      const currentMarketValue = currentPrice * holding.quantity;
      const profitLoss = currentMarketValue - holding.totalCost;
      const profitLossPercentage = holding.totalCost > 0 ? (profitLoss / holding.totalCost) * 100 : 0;

      totalHoldingsCost += holding.totalCost;
      totalHoldingsValue += currentMarketValue;

      return {
        _id: holding._id,
        stock: holding.stock ? holding.stock._id : null,
        symbol: holding.symbol,
        name: stockName,
        quantity: holding.quantity,
        averageBuyPrice: holding.averageBuyPrice,
        totalCost: holding.totalCost,
        currentPrice,
        currentMarketValue,
        profitLoss,
        profitLossPercentage,
      };
    });

    const netWorth = user.balance + totalHoldingsValue;
    const totalProfitLoss = totalHoldingsValue - totalHoldingsCost;
    const totalProfitLossPercentage = totalHoldingsCost > 0 ? (totalProfitLoss / totalHoldingsCost) * 100 : 0;

    res.json({
      success: true,
      data: {
        holdings: detailedHoldings,
        summary: {
          cashBalance: user.balance,
          totalHoldingsCost,
          totalHoldingsValue,
          netWorth,
          totalProfitLoss,
          totalProfitLossPercentage,
        },
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get user transaction history
// @route   GET /api/portfolio/transactions
// @access  Private
const getUserTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find({ user: req.user._id }).sort({
      timestamp: -1,
    });
    res.json({ success: true, count: transactions.length, data: transactions });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getPortfolio,
  getUserTransactions,
};
