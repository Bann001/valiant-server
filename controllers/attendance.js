const Attendance = require('../models/Attendance');
const Employee = require('../models/Employee');

// @desc    Get attendance records by date and filters
// @route   GET /api/attendance
// @access  Private
exports.getAttendanceByDateRange = async (req, res) => {
  try {
    const { date, status, vessel } = req.query;
    
    // Validate required parameters
    if (!date) {
      return res.status(400).json({
        success: false,
        message: 'Date is required'
      });
    }

    // Build query
    const query = {
      date: new Date(date)
    };

    if (status && status !== 'all') {
      query.status = status;
    }

    if (vessel && vessel !== 'all') {
      query.vessel = vessel;
    }

    // Get attendance records
    const attendanceRecords = await Attendance.find(query)
      .populate('employeeId', 'firstName lastName position vessel')
      .sort({ date: -1 });

    // Transform data for frontend
    const transformedData = attendanceRecords.map(record => ({
      employeeId: record.employeeId.employeeId,
      employeeName: `${record.employeeId.firstName} ${record.employeeId.lastName}`,
      position: record.employeeId.position,
      vessel: record.vessel,
      status: record.status,
      day: record.day,
      night: record.night,
      otDay: record.otDay,
      otNight: record.otNight,
      np: record.np
    }));

    res.status(200).json({
      success: true,
      data: transformedData
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
    const { date, status, day, night, otDay, otNight, np, vessel } = req.body;
    
    // Validate required fields
    if (!date || !status || !vessel) {
      return res.status(400).json({
        success: false,
        message: 'Date, status, and vessel are required'
      });
    }

    // Update attendance record
    const updatedRecord = await Attendance.findByIdAndUpdate(
      id,
      {
        date,
        status,
        day: Boolean(day),
        night: Boolean(night),
        otDay: Boolean(otDay),
        otNight: Boolean(otNight),
        np: Boolean(np),
        vessel
      },
      { new: true }
    );

    if (!updatedRecord) {
      return res.status(404).json({
        success: false,
        message: 'Attendance record not found'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        employeeId: updatedRecord.employeeId,
        date: updatedRecord.date,
        status: updatedRecord.status,
        day: updatedRecord.day,
        night: updatedRecord.night,
        otDay: updatedRecord.otDay,
        otNight: updatedRecord.otNight,
        np: updatedRecord.np,
        vessel: updatedRecord.vessel
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

// @desc    Create new attendance record
// @route   POST /api/attendance
// @access  Private
exports.createAttendance = async (req, res) => {
  try {
    const { employeeId, date, status, day, night, otDay, otNight, np, vessel } = req.body;

    // Validate required fields
    if (!employeeId || !date || !status || !vessel) {
      return res.status(400).json({
        success: false,
        message: 'Employee ID, date, status, and vessel are required'
      });
    }

    // Check if attendance record already exists for this employee on this date
    const existingRecord = await Attendance.findOne({
      employeeId,
      date: new Date(date)
    });

    if (existingRecord) {
      return res.status(400).json({
        success: false,
        message: 'Attendance record already exists for this employee on this date'
      });
    }

    // Create new attendance record
    const attendance = await Attendance.create({
      employeeId,
      date: new Date(date),
      status,
      day: Boolean(day),
      night: Boolean(night),
      otDay: Boolean(otDay),
      otNight: Boolean(otNight),
      np: Boolean(np),
      vessel
    });

    res.status(201).json({
      success: true,
      data: {
        employeeId: attendance.employeeId,
        date: attendance.date,
        status: attendance.status,
        day: attendance.day,
        night: attendance.night,
        otDay: attendance.otDay,
        otNight: attendance.otNight,
        np: attendance.np,
        vessel: attendance.vessel
      }
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: err.message
    });
  }

  // @desc    Save bulk attendance
// @route   POST /api/attendance/bulk
// @access  Private
exports.saveBulkAttendance = async (req, res) => {
  res.status(501).json({ success: false, message: 'Not implemented yet' });
};

// @desc    Export attendance
// @route   GET /api/attendance/export
// @access  Private
exports.exportAttendance = async (req, res) => {
  res.status(501).json({ success: false, message: 'Not implemented yet' });
};
};