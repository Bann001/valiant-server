const express = require('express');
const { getDashboardStats } = require('../controllers/dashboard');
const { protect } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/dashboard/stats
// @desc    Get dashboard statistics
// @access  Private
router.get('/stats', protect, getDashboardStats);

module.exports = router; 