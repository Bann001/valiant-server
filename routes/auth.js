const express = require('express');
const router = express.Router();
const { login, getMe } = require('../controllers/auth');
const { protect } = require('../middleware/auth');

// Error handler middleware
const asyncHandler = fn => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(error => {
    console.error('Auth route error:', error);
    res.status(500).json({
      success: false,
      message: 'Authentication error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  });
};

// Mount routes
router.post('/login', login);
router.get('/me', protect, getMe);

module.exports = router; 