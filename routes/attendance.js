const express = require('express');
const attendanceController = require('../controllers/attendance');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Get attendance records by date and filters
router.get('/', protect, attendanceController.getAttendanceByDateRange);

// Update existing attendance record
router.put('/:id', protect, attendanceController.updateAttendance);

// Create new attendance record
router.post('/', protect, attendanceController.createAttendance);

// Save bulk attendance records
router.post('/bulk', protect, attendanceController.saveBulkAttendance);
router.get('/export', protect, attendanceController.exportAttendance);

// Export attendance records
router.get('/export', protect, attendanceController.exportAttendance);

module.exports = router;