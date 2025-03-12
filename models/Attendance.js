const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: [true, 'Employee is required']
  },
  date: {
    type: Date,
    required: [true, 'Date is required'],
    default: Date.now
  },
  status: {
    type: String,
    enum: ['Present', 'Absent', 'Late', 'On Leave'],
    required: [true, 'Status is required']
  },
  timeIn: {
    type: Date
  },
  timeOut: {
    type: Date
  },
  remarks: {
    type: String
  }
}, {
  timestamps: true
});

// Create compound index for employee and date to prevent duplicate entries
attendanceSchema.index({ employee: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Attendance', attendanceSchema);