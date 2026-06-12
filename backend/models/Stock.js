const mongoose = require('mongoose');

const StockHistorySchema = new mongoose.Schema({
  price: {
    type: Number,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

const StockSchema = new mongoose.Schema({
  symbol: {
    type: String,
    required: [true, 'Please add a stock symbol'],
    unique: true,
    uppercase: true,
    trim: true,
    index: true,
  },
  name: {
    type: String,
    required: [true, 'Please add a company name'],
    trim: true,
  },
  price: {
    type: Number,
    required: true,
  },
  prevClose: {
    type: Number,
    required: true,
  },
  high: {
    type: Number,
    required: true,
  },
  low: {
    type: Number,
    required: true,
  },
  volume: {
    type: Number,
    default: 0,
  },
  sector: {
    type: String,
    default: 'General',
  },
  description: {
    type: String,
    default: '',
  },
  history: [StockHistorySchema],
});

module.exports = mongoose.model('Stock', StockSchema);
