const express = require('express');
const { 
  getAttendanceByDateRange, 
  updateAttendance, 
  saveBulkAttendance, 
  exportAttendance,
  createAttendance
} = require('../controllers/attendance');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Get attendance records by date and filters
router.get('/', protect, getAttendanceByDateRange);

// Update existing attendance record
router.put('/:id', protect, updateAttendance);

// Create new attendance record
router.post('/', protect, createAttendance);

// Save bulk attendance records
router.post('/bulk', protect, saveBulkAttendance);

// Export attendance records
router.get('/export', protect, exportAttendance);

module.exports = router;