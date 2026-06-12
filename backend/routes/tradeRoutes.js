const express = require('express');
const { buyStock, sellStock } = require('../controllers/tradeController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect); // Secure all trade routes

router.post('/buy', buyStock);
router.post('/sell', sellStock);

module.exports = router;
