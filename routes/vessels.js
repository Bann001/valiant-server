const express = require('express');
const { 
  getVessels, 
  getVessel, 
  createVessel, 
  updateVessel, 
  deleteVessel,
  addEmployeeToVessel,
  removeEmployeeFromVessel
} = require('../controllers/vessels');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Public routes
router.get('/', getVessels);
router.get('/:id', getVessel);

// Protected routes
router.post('/', protect, createVessel);
router.put('/:id', protect, updateVessel);
router.delete('/:id', protect, deleteVessel);

// Employee assignment routes
router.post('/:id/employees', protect, addEmployeeToVessel);
router.delete('/:id/employees/:employeeId', protect, removeEmployeeFromVessel);

module.exports = router; 