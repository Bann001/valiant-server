const Vessel = require('../models/Vessel');
const Employee = require('../models/Employee');

// @desc    Get all vessels
// @route   GET /api/vessels
// @access  Public
exports.getVessels = async (req, res) => {
  try {
    console.log('Fetching vessels...');
    const vessels = await Vessel.find().sort({ createdAt: -1 });
    console.log('Found vessels:', vessels);
    
    res.status(200).json({
      success: true,
      count: vessels.length,
      data: vessels
    });
  } catch (err) {
    console.error('Error in getVessels:', err);
    res.status(500).json({
      success: false,
      message: 'Error fetching vessels',
      error: err.message
    });
  }
};

// @desc    Get single vessel
// @route   GET /api/vessels/:id
// @access  Public
exports.getVessel = async (req, res) => {
  try {
    const vessel = await Vessel.findById(req.params.id);

    if (!vessel) {
      return res.status(404).json({
        success: false,
        message: 'Vessel not found'
      });
    }

    res.status(200).json({
      success: true,
      data: vessel
    });
  } catch (err) {
    console.error('Error in getVessel:', err);
    res.status(500).json({
      success: false,
      message: 'Error fetching vessel',
      error: err.message
    });
  }
};

// @desc    Create vessel
// @route   POST /api/vessels
// @access  Private
exports.createVessel = async (req, res) => {
  try {
    console.log('Creating vessel with data:', req.body);
    const vessel = await Vessel.create(req.body);
    console.log('Created vessel:', vessel);

    res.status(201).json({
      success: true,
      data: vessel
    });
  } catch (err) {
    console.error('Error in createVessel:', err);
    if (err.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Vessel with this ID or IMO number already exists',
        error: err.message
      });
    }
    res.status(500).json({
      success: false,
      message: 'Error creating vessel',
      error: err.message
    });
  }
};

// @desc    Update vessel
// @route   PUT /api/vessels/:id
// @access  Private
exports.updateVessel = async (req, res) => {
  try {
    console.log('Updating vessel with data:', req.body);
    const vessel = await Vessel.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );

    if (!vessel) {
      return res.status(404).json({
        success: false,
        message: 'Vessel not found'
      });
    }

    res.status(200).json({
      success: true,
      data: vessel
    });
  } catch (err) {
    console.error('Error in updateVessel:', err);
    res.status(500).json({
      success: false,
      message: 'Error updating vessel',
      error: err.message
    });
  }
};

// @desc    Delete vessel
// @route   DELETE /api/vessels/:id
// @access  Private
exports.deleteVessel = async (req, res) => {
  try {
    const vessel = await Vessel.findByIdAndDelete(req.params.id);

    if (!vessel) {
      return res.status(404).json({
        success: false,
        message: 'Vessel not found'
      });
    }

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (err) {
    console.error('Error in deleteVessel:', err);
    res.status(500).json({
      success: false,
      message: 'Error deleting vessel',
      error: err.message
    });
  }
};

// @desc    Add employee to vessel
// @route   POST /api/vessels/:id/employees
// @access  Private
exports.addEmployeeToVessel = async (req, res) => {
  try {
    const { employeeId } = req.body;
    
    if (!employeeId) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an employee ID'
      });
    }

    // Check if employee exists
    const employee = await Employee.findById(employeeId);
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }

    // Find vessel and update
    const vessel = await Vessel.findById(req.params.id);
    if (!vessel) {
      return res.status(404).json({
        success: false,
        message: 'Vessel not found'
      });
    }

    // Check if employee is already assigned to this vessel
    if (vessel.assignedEmployees.includes(employeeId)) {
      return res.status(400).json({
        success: false,
        message: 'Employee is already assigned to this vessel'
      });
    }

    // Add employee to vessel
    vessel.assignedEmployees.push(employeeId);
    await vessel.save();

    res.status(200).json({
      success: true,
      data: vessel
    });
  } catch (err) {
    console.error('Error in addEmployeeToVessel:', err);
    res.status(500).json({
      success: false,
      message: 'Error adding employee to vessel',
      error: err.message
    });
  }
};

// @desc    Remove employee from vessel
// @route   DELETE /api/vessels/:id/employees/:employeeId
// @access  Private
exports.removeEmployeeFromVessel = async (req, res) => {
  try {
    // Find vessel
    const vessel = await Vessel.findById(req.params.id);
    if (!vessel) {
      return res.status(404).json({
        success: false,
        message: 'Vessel not found'
      });
    }

    // Check if employee is assigned to this vessel
    if (!vessel.assignedEmployees.includes(req.params.employeeId)) {
      return res.status(400).json({
        success: false,
        message: 'Employee is not assigned to this vessel'
      });
    }

    // Remove employee from vessel
    vessel.assignedEmployees = vessel.assignedEmployees.filter(
      id => id.toString() !== req.params.employeeId
    );
    await vessel.save();

    res.status(200).json({
      success: true,
      data: vessel
    });
  } catch (err) {
    console.error('Error in removeEmployeeFromVessel:', err);
    res.status(500).json({
      success: false,
      message: 'Error removing employee from vessel',
      error: err.message
    });
  }
}; 