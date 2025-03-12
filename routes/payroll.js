const express = require('express');
const {
  getPayrolls,
  getPayrollsByVessel,
  createPayroll,
  createBulkPayrolls,
  updatePayroll,
  deletePayroll
} = require('../controllers/payroll');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Base routes
router.route('/')
  .get(protect, getPayrolls)
  .post(protect, createPayroll);

// Bulk import route
router.post('/bulk', protect, createBulkPayrolls);

// Vessel-specific payroll route
router.get('/vessel/:vesselId', protect, getPayrollsByVessel);

// Individual payroll routes
router.route('/:id')
  .put(protect, updatePayroll)
  .delete(protect, deletePayroll);

module.exports = router; 