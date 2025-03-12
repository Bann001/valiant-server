const Employee = require('../models/Employee');
const Department = require('../models/Department');
const Attendance = require('../models/Attendance');

// @desc    Get dashboard statistics
// @route   GET /api/dashboard/stats
// @access  Private
exports.getDashboardStats = async (req, res) => {
  try {
    // Get total number of employees
    const employeeCount = await Employee.countDocuments();

    // Get total number of departments
    const departmentCount = await Department.countDocuments();

    // Get unique positions count
    const positions = await Employee.distinct('position');
    const positionsCount = positions.length;

    // Calculate attendance percentage for today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const totalEmployees = await Employee.countDocuments({ status: 'Active' });
    const presentToday = await Attendance.countDocuments({
      date: {
        $gte: today,
        $lt: tomorrow
      },
      status: 'Present'
    });

    const attendancePercentage = totalEmployees > 0 
      ? Math.round((presentToday / totalEmployees) * 100) 
      : 0;

    // Get payroll status (you can modify this based on your payroll logic)
    const payrollStatus = 'Up to date'; // This should be calculated based on your business logic

    // Return dashboard statistics
    res.status(200).json({
      success: true,
      data: {
        employees: employeeCount,
        departments: departmentCount,
        positions: positionsCount,
        attendance: `${attendancePercentage}%`,
        payroll: payrollStatus
      }
    });
  } catch (err) {
    console.error('Error getting dashboard stats:', err);
    res.status(500).json({
      success: false,
      message: 'Error fetching dashboard statistics',
      error: err.message
    });
  }
}; 