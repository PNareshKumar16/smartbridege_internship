const express = require('express');
const {
  getAllUsers,
  adjustUserBalance,
  createStock,
  updateStock,
  deleteStock,
  getPlatformStats,
} = require('../controllers/adminController');
const { protect, admin } = require('../middleware/authMiddleware');

const router = express.Router();

// Apply auth protection & admin check to all endpoints in this file
router.use(protect);
router.use(admin);

router.get('/users', getAllUsers);
router.put('/users/:id/balance', adjustUserBalance);
router.post('/stocks', createStock);
router.put('/stocks/:id', updateStock);
router.delete('/stocks/:id', deleteStock);
router.get('/stats', getPlatformStats);

module.exports = router;
