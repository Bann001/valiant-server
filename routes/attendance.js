const express = require('express');
const { 
  getAttendanceByDateRange, 
  updateAttendance, 
  saveBulkAttendance, 
  exportAttendance 
} = require('../controllers/attendance');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.get('/', protect, getAttendanceByDateRange);
router.put('/:id', protect, updateAttendance);
router.post('/bulk', protect, saveBulkAttendance);
router.get('/export', protect, exportAttendance);

module.exports = router; 