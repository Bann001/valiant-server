const express = require('express');
const {
  register,
  login,
  getMe
} = require('../controllers/auth');

const router = express.Router();

const { protect } = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);

// @route   GET /api/users
// @desc    Get all users
// @access  Private/Admin
router.get('/', (req, res) => {
  res.json({ success: true, message: 'Get all users' });
});

// @route   GET /api/users/:id
// @desc    Get user by ID
// @access  Private/Admin
router.get('/:id', (req, res) => {
  res.json({ success: true, message: `Get user with ID ${req.params.id}` });
});

module.exports = router; 