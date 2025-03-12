const express = require('express');
const { 
  getReportSummary, 
  generateEmployeeReport, 
  generatePayrollReport, 
  generateAttendanceReport, 
  generateVesselReport,
  exportReports,
  importReports
} = require('../controllers/reports');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.get('/summary', protect, getReportSummary);
router.get('/employees', protect, generateEmployeeReport);
router.get('/payroll', protect, generatePayrollReport);
router.get('/attendance', protect, generateAttendanceReport);
router.get('/vessels', protect, generateVesselReport);
router.get('/export', protect, exportReports);
router.post('/import', protect, importReports);

module.exports = router; 