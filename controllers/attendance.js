const Employee = require('../models/Employee');

// @desc    Get attendance records by date range
// @route   GET /api/attendance
// @access  Private
exports.getAttendanceByDateRange = async (req, res) => {
  try {
    const { startDate, endDate, vessel, employeeId } = req.query;
    
    // Validate dates
    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'Please provide start and end dates'
      });
    }

    // Build query
    let query = {};
    
    // Add vessel filter if provided
    if (vessel && vessel !== 'all') {
      query.vessel = vessel;
    }

    // Add employee ID filter if provided
    if (employeeId) {
      query.employee_id = employeeId;
    }

    // Get employees based on filters
    const employees = await Employee.find(query).select('employee_id firstName lastName position vessel');
    
    // Create attendance records for each employee
    const attendanceRecords = employees.map(employee => {
      return {
        employeeId: employee.employee_id,
        employeeName: `${employee.firstName} ${employee.lastName}`,
        position: employee.position,
        vessel: employee.vessel,
        day: Math.random() > 0.3, // Random attendance data
        night: Math.random() > 0.7,
        otDay: Math.random() > 0.8,
        otNight: Math.random() > 0.9,
        np: Math.random() > 0.95
      };
    });
    
    res.status(200).json({
      success: true,
      data: attendanceRecords
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: err.message
    });
  }
};

// @desc    Update attendance record
// @route   PUT /api/attendance/:id
// @access  Private
exports.updateAttendance = async (req, res) => {
  try {
    const { id } = req.params;
    const { date, ...attendanceData } = req.body;
    
    // In a real application, you would update the attendance record in your database
    // For demo purposes, we'll just return the updated data
    
    res.status(200).json({
      success: true,
      data: {
        employeeId: id,
        date,
        ...attendanceData
      }
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: err.message
    });
  }
};

// @desc    Save bulk attendance records
// @route   POST /api/attendance/bulk
// @access  Private
exports.saveBulkAttendance = async (req, res) => {
  try {
    const { records } = req.body;
    
    // In a real application, you would save the attendance records in your database
    // For demo purposes, we'll just return success
    
    res.status(200).json({
      success: true,
      message: `${records.length} attendance records saved successfully`
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: err.message
    });
  }
};

// @desc    Export attendance records
// @route   GET /api/attendance/export
// @access  Private
exports.exportAttendance = async (req, res) => {
  try {
    const { startDate, endDate, vessel, format } = req.query;
    
    // In a real application, you would generate a CSV or Excel file with attendance data
    // For demo purposes, we'll just return a mock CSV content
    
    const mockCSV = 'Employee ID,Employee Name,Position,Day,Night,OT Day,OT Night,NP\n' +
                   '000100,Emilia De Rothschild,Admin,1,0,0,0,0\n' +
                   '000200,Aisha Garcia,Fighter,1,1,0,0,0\n' +
                   '000300,Akio Morishimoto,Support,1,1,1,1,0';
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=attendance_${startDate}_${endDate}.csv`);
    
    res.status(200).send(mockCSV);
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: err.message
    });
  }
}; 