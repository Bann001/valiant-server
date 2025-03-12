const express = require('express');
const {
  getEmployees,
  getEmployee,
  createEmployee,
  updateEmployee,
  deleteEmployee
} = require('../controllers/employees');

const router = express.Router();

const { protect, authorize } = require('../middleware/auth');

router
  .route('/')
  .get(protect, getEmployees)
  .post(protect, authorize('admin', 'manager'), createEmployee);

router
  .route('/:id')
  .get(protect, getEmployee)
  .put(protect, authorize('admin', 'manager'), updateEmployee)
  .delete(protect, authorize('admin'), deleteEmployee);

module.exports = router; 