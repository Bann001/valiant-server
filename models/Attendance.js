const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  employeeId: {
    type: String,
    required: true,
    ref: 'Employee'
  },
  date: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['Active', 'On Leave', 'Terminated'],
    default: 'Active'
  },
  day: {
    type: Boolean,
    default: false
  },
  night: {
    type: Boolean,
    default: false
  },
  otDay: {
    type: Boolean,
    default: false
  },
  otNight: {
    type: Boolean,
    default: false
  },
  np: {
    type: Boolean,
    default: false
  },
  vessel: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

// Create indexes for better query performance
attendanceSchema.index({ employeeId: 1, date: 1 });
attendanceSchema.index({ date: 1 });
attendanceSchema.index({ status: 1 });

module.exports = mongoose.model('Attendance', attendanceSchema);