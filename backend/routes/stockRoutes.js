const express = require('express');
const {
  getStocks,
  getStockBySymbol,
  getStockHistory,
} = require('../controllers/stockController');

const router = express.Router();

router.get('/', getStocks);
router.get('/:symbol', getStockBySymbol);
router.get('/:symbol/chart', getStockHistory);

module.exports = router;
