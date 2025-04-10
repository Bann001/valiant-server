const express = require('express');
const router = express.Router();
const { login, getMe } = require('../controllers/auth');
const { protect } = require('../middleware/auth');

// Handle CORS preflight requests
router.options('*', (req, res) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.status(200).end();
});

// Error handler middleware
const asyncHandler = fn => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(error => {
    console.error('Auth route error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Authentication error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  });
};

// Mount routes
router.post('/login', asyncHandler(login));
router.get('/me', protect, asyncHandler(getMe));

// Add an explicit 404 handler for this router
router.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} not found in auth routes`
  });
});

module.exports = router;