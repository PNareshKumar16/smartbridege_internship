const Stock = require('../models/Stock');

// @desc    Get all stocks
// @route   GET /api/stocks
// @access  Public
const getStocks = async (req, res) => {
  try {
    const stocks = await Stock.find({}).select('-history'); // Exclude history for main dashboard speed
    res.json({ success: true, count: stocks.length, data: stocks });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single stock by symbol
// @route   GET /api/stocks/:symbol
// @access  Public
const getStockBySymbol = async (req, res) => {
  try {
    const stock = await Stock.findOne({ symbol: req.params.symbol.toUpperCase() });

    if (stock) {
      res.json({ success: true, data: stock });
    } else {
      res.status(404).json({ success: false, message: 'Stock not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get stock price history
// @route   GET /api/stocks/:symbol/chart
// @access  Public
const getStockHistory = async (req, res) => {
  try {
    const stock = await Stock.findOne({ symbol: req.params.symbol.toUpperCase() }).select('history symbol price name');

    if (stock) {
      res.json({ success: true, symbol: stock.symbol, name: stock.name, price: stock.price, history: stock.history });
    } else {
      res.status(404).json({ success: false, message: 'Stock not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Background Price Simulator
// Fluctuates all stock prices randomly between -1.5% and +1.5%
const simulateStockFluctuations = async () => {
  try {
    const stocks = await Stock.find({});
    
    for (let stock of stocks) {
      // Calculate random fluctuation (-1.5% to +1.5%)
      const changePercent = (Math.random() * 3 - 1.5) / 100;
      const oldPrice = stock.price;
      const newPrice = Math.round((oldPrice * (1 + changePercent)) * 100) / 100;

      // Ensure price doesn't drop below $1.00
      const finalPrice = Math.max(1.00, newPrice);

      // Update daily high/low
      let newHigh = stock.high;
      let newLow = stock.low;
      if (finalPrice > stock.high) newHigh = finalPrice;
      if (finalPrice < stock.low) newLow = finalPrice;

      // Update stock
      stock.price = finalPrice;
      stock.high = newHigh;
      stock.low = newLow;
      
      // Append to history
      stock.history.push({
        price: finalPrice,
        timestamp: new Date()
      });

      // Keep only last 50 history entries
      if (stock.history.length > 50) {
        stock.history.shift();
      }

      await stock.save();
    }
  } catch (error) {
    console.error('Error in Stock Price Simulator:', error.message);
  }
};

module.exports = {
  getStocks,
  getStockBySymbol,
  getStockHistory,
  simulateStockFluctuations,
};
