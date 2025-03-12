const Payroll = require('../models/Payroll');
const Employee = require('../models/Employee');
const Vessel = require('../models/Vessel');

// @desc    Get all payrolls
// @route   GET /api/payroll
// @access  Private
exports.getPayrolls = async (req, res) => {
  try {
    const { vesselId, startDate, endDate } = req.query;
    let query = {};

    // Filter by vessel if provided
    if (vesselId) {
      query.vessel = vesselId;
    }

    // Filter by date range if provided
    if (startDate && endDate) {
      query['payPeriod.startDate'] = { $gte: new Date(startDate) };
      query['payPeriod.endDate'] = { $lte: new Date(endDate) };
    }

    const payrolls = await Payroll.find(query)
      .populate('employee', 'firstName lastName position')
      .populate('vessel', 'vesselName vesselId')
      .sort({ 'payPeriod.endDate': -1 });

    res.status(200).json({
      success: true,
      count: payrolls.length,
      data: payrolls
    });
  } catch (err) {
    console.error('Error in getPayrolls:', err);
    res.status(500).json({
      success: false,
      message: 'Error fetching payrolls',
      error: err.message
    });
  }
};

// @desc    Get payrolls by vessel
// @route   GET /api/payroll/vessel/:vesselId
// @access  Private
exports.getPayrollsByVessel = async (req, res) => {
  try {
    const { vesselId } = req.params;
    const { startDate, endDate } = req.query;

    // Find vessel
    const vessel = await Vessel.findById(vesselId);
    if (!vessel) {
      return res.status(404).json({
        success: false,
        message: 'Vessel not found'
      });
    }

    // Build query
    let query = { vessel: vesselId };
    
    // Add date range if provided
    if (startDate && endDate) {
      query['payPeriod.startDate'] = { $gte: new Date(startDate) };
      query['payPeriod.endDate'] = { $lte: new Date(endDate) };
    }

    // Get payrolls for this vessel
    const payrolls = await Payroll.find(query)
      .populate('employee', 'firstName lastName position employeeId')
      .sort({ 'payPeriod.endDate': -1 });

    // If no payrolls found, get employees assigned to this vessel
    if (payrolls.length === 0) {
      // Get employees assigned to this vessel
      const vesselWithEmployees = await Vessel.findById(vesselId)
        .populate('assignedEmployees', 'firstName lastName position employeeId salary');

      if (!vesselWithEmployees || !vesselWithEmployees.assignedEmployees) {
        return res.status(200).json({
          success: true,
          count: 0,
          data: []
        });
      }

      // Create empty payroll records for each employee
      const emptyPayrolls = vesselWithEmployees.assignedEmployees.map(employee => ({
        employee: {
          _id: employee._id,
          firstName: employee.firstName,
          lastName: employee.lastName,
          position: employee.position,
          employeeId: employee.employeeId
        },
        vessel: {
          _id: vessel._id,
          vesselName: vessel.vesselName,
          vesselId: vessel.vesselId
        },
        rate: employee.salary || 0,
        regularHours: 0,
        overtimeHours: 0,
        nightDifferentialHours: 0,
        sundayHours: 0,
        sundayOvertimeHours: 0,
        grossPay: 0,
        netPay: 0
      }));

      return res.status(200).json({
        success: true,
        count: emptyPayrolls.length,
        data: emptyPayrolls
      });
    }

    res.status(200).json({
      success: true,
      count: payrolls.length,
      data: payrolls
    });
  } catch (err) {
    console.error('Error in getPayrollsByVessel:', err);
    res.status(500).json({
      success: false,
      message: 'Error fetching payrolls by vessel',
      error: err.message
    });
  }
};

// @desc    Create payroll
// @route   POST /api/payroll
// @access  Private
exports.createPayroll = async (req, res) => {
  try {
    const payroll = await Payroll.create(req.body);

    res.status(201).json({
      success: true,
      data: payroll
    });
  } catch (err) {
    console.error('Error in createPayroll:', err);
    if (err.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Payroll for this employee and pay period already exists',
        error: err.message
      });
    }
    res.status(500).json({
      success: false,
      message: 'Error creating payroll',
      error: err.message
    });
  }
};

// @desc    Create multiple payrolls (bulk import)
// @route   POST /api/payroll/bulk
// @access  Private
exports.createBulkPayrolls = async (req, res) => {
  try {
    const { payrolls } = req.body;

    if (!payrolls || !Array.isArray(payrolls) || payrolls.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an array of payroll data'
      });
    }

    // Process each payroll entry
    const processedPayrolls = [];
    const errors = [];

    for (let i = 0; i < payrolls.length; i++) {
      const payrollData = payrolls[i];
      
      try {
        // Find employee by employeeId if provided
        if (payrollData.employeeId && !payrollData.employee) {
          const employee = await Employee.findOne({ employeeId: payrollData.employeeId });
          if (employee) {
            payrollData.employee = employee._id;
          } else {
            errors.push(`Employee with ID ${payrollData.employeeId} not found`);
            continue;
          }
        }

        // Find vessel by vesselId if provided
        if (payrollData.vesselId && !payrollData.vessel) {
          const vessel = await Vessel.findOne({ vesselId: payrollData.vesselId });
          if (vessel) {
            payrollData.vessel = vessel._id;
          } else {
            errors.push(`Vessel with ID ${payrollData.vesselId} not found`);
            continue;
          }
        }

        // Calculate gross pay if not provided
        if (!payrollData.grossPay && payrollData.rate) {
          const regularPay = (payrollData.regularHours || 0) * payrollData.rate;
          const otPay = (payrollData.overtimeHours || 0) * payrollData.rate * 1.25;
          const ndPay = (payrollData.nightDifferentialHours || 0) * payrollData.rate * 1.1;
          const sundayPay = (payrollData.sundayHours || 0) * payrollData.rate * 1.3;
          const sundayOtPay = (payrollData.sundayOvertimeHours || 0) * payrollData.rate * 1.69;
          const holidayPay = (payrollData.holidayHours || 0) * payrollData.rate * 2;
          const holidayOtPay = (payrollData.holidayOvertimeHours || 0) * payrollData.rate * 2.6;
          
          payrollData.grossPay = regularPay + otPay + ndPay + sundayPay + sundayOtPay + holidayPay + holidayOtPay;
        }

        // Calculate net pay if not provided
        if (!payrollData.netPay && payrollData.grossPay) {
          const totalDeductions = 
            (payrollData.deductions?.sss || 0) + 
            (payrollData.deductions?.philhealth || 0) + 
            (payrollData.deductions?.pagibig || 0) + 
            (payrollData.deductions?.tax || 0) + 
            (payrollData.deductions?.other || 0);
          
          payrollData.netPay = payrollData.grossPay - totalDeductions;
        }

        // Create payroll
        const payroll = await Payroll.create(payrollData);
        processedPayrolls.push(payroll);
      } catch (error) {
        errors.push(`Error processing payroll at index ${i}: ${error.message}`);
      }
    }

    res.status(201).json({
      success: true,
      count: processedPayrolls.length,
      data: processedPayrolls,
      errors: errors.length > 0 ? errors : undefined
    });
  } catch (err) {
    console.error('Error in createBulkPayrolls:', err);
    res.status(500).json({
      success: false,
      message: 'Error creating bulk payrolls',
      error: err.message
    });
  }
};

// @desc    Update payroll
// @route   PUT /api/payroll/:id
// @access  Private
exports.updatePayroll = async (req, res) => {
  try {
    const payroll = await Payroll.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );

    if (!payroll) {
      return res.status(404).json({
        success: false,
        message: 'Payroll not found'
      });
    }

    res.status(200).json({
      success: true,
      data: payroll
    });
  } catch (err) {
    console.error('Error in updatePayroll:', err);
    res.status(500).json({
      success: false,
      message: 'Error updating payroll',
      error: err.message
    });
  }
};

// @desc    Delete payroll
// @route   DELETE /api/payroll/:id
// @access  Private
exports.deletePayroll = async (req, res) => {
  try {
    const payroll = await Payroll.findByIdAndDelete(req.params.id);

    if (!payroll) {
      return res.status(404).json({
        success: false,
        message: 'Payroll not found'
      });
    }

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (err) {
    console.error('Error in deletePayroll:', err);
    res.status(500).json({
      success: false,
      message: 'Error deleting payroll',
      error: err.message
    });
  }
};

// @desc    Generate payroll voucher
// @route   POST /api/payroll/voucher
// @access  Private
exports.generateVoucher = async (req, res) => {
  try {
    const { startDate, endDate, vessel, employee, description } = req.body;
    
    // In a real application, you would generate a PDF voucher
    // For demo purposes, we'll just return a mock PDF content
    
    // Create a simple text representation of a voucher
    const voucherContent = `
      PAYROLL VOUCHER
      ===============
      
      Date Range: ${startDate} - ${endDate}
      Vessel: ${vessel || 'All Vessels'}
      Employee: ${employee || 'All Employees'}
      
      Description:
      ${description || 'No description provided'}
      
      Generated on: ${new Date().toISOString()}
      
      This is a mock payroll voucher for demonstration purposes.
    `;
    
    // Convert to Buffer
    const buffer = Buffer.from(voucherContent);
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=payroll_voucher_${startDate}_${endDate}.pdf`);
    
    res.status(200).send(buffer);
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: err.message
    });
  }
};

// @desc    Export payroll data
// @route   GET /api/payroll/export
// @access  Private
exports.exportPayroll = async (req, res) => {
  try {
    const { vessel, format } = req.query;
    
    // In a real application, you would generate a CSV or Excel file with payroll data
    // For demo purposes, we'll just return a mock CSV content
    
    const mockCSV = 'Employee ID,Employee Name,Position,Rate,FR,Regular,OT,NP,SUN,SUN OT\n' +
                   '000001,Emilia De Rothschild,Admin,16983.67,0,0,0,0,0,0\n' +
                   '000002,Aisha Garcia,Fighter,45697.22,0,0,0,0,0,0\n' +
                   '000003,Akio Morishimoto,Support,42334.65,0,0,0,0,0,0';
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=payroll_export.csv`);
    
    res.status(200).send(mockCSV);
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: err.message
    });
  }
};

// @desc    Import payroll data
// @route   POST /api/payroll/import
// @access  Private
exports.importPayroll = async (req, res) => {
  try {
    // In a real application, you would process the uploaded file
    // For demo purposes, we'll just return success
    
    res.status(200).json({
      success: true,
      message: 'Payroll data imported successfully'
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: err.message
    });
  }
}; 