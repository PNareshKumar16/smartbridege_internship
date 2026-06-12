const express = require('express');
const {
  getPortfolio,
  getUserTransactions,
} = require('../controllers/portfolioController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect); // Secure all portfolio routes

router.get('/', getPortfolio);
router.get('/transactions', getUserTransactions);

module.exports = router;
