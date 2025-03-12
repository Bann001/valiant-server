const express = require('express');
const {
  getDepartments,
  getDepartment,
  createDepartment,
  updateDepartment,
  deleteDepartment,
  initializeDepartments
} = require('../controllers/departments');

const router = express.Router();

const { protect, authorize } = require('../middleware/auth');

router
  .route('/')
  .get(protect, getDepartments)
  .post(protect, authorize('admin'), createDepartment);

router
  .route('/initialize')
  .post(protect, authorize('admin'), initializeDepartments);

router
  .route('/:id')
  .get(protect, getDepartment)
  .put(protect, authorize('admin'), updateDepartment)
  .delete(protect, authorize('admin'), deleteDepartment);

module.exports = router; 