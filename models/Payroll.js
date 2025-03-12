const mongoose = require('mongoose');

const payrollSchema = new mongoose.Schema({
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: [true, 'Employee is required']
  },
  vessel: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vessel'
  },
  payPeriod: {
    startDate: {
      type: Date,
      required: [true, 'Pay period start date is required']
    },
    endDate: {
      type: Date,
      required: [true, 'Pay period end date is required']
    }
  },
  regularHours: {
    type: Number,
    default: 0
  },
  overtimeHours: {
    type: Number,
    default: 0
  },
  nightDifferentialHours: {
    type: Number,
    default: 0
  },
  sundayHours: {
    type: Number,
    default: 0
  },
  sundayOvertimeHours: {
    type: Number,
    default: 0
  },
  holidayHours: {
    type: Number,
    default: 0
  },
  holidayOvertimeHours: {
    type: Number,
    default: 0
  },
  rate: {
    type: Number,
    required: [true, 'Rate is required']
  },
  grossPay: {
    type: Number,
    required: [true, 'Gross pay is required']
  },
  deductions: {
    sss: {
      type: Number,
      default: 0
    },
    philhealth: {
      type: Number,
      default: 0
    },
    pagibig: {
      type: Number,
      default: 0
    },
    tax: {
      type: Number,
      default: 0
    },
    other: {
      type: Number,
      default: 0
    }
  },
  netPay: {
    type: Number,
    required: [true, 'Net pay is required']
  },
  status: {
    type: String,
    enum: ['Pending', 'Processed', 'Paid'],
    default: 'Pending'
  },
  paymentDate: {
    type: Date
  },
  remarks: {
    type: String
  }
}, {
  timestamps: true
});

// Create compound index for employee and pay period to prevent duplicate entries
payrollSchema.index({ employee: 1, 'payPeriod.startDate': 1, 'payPeriod.endDate': 1 }, { unique: true });

module.exports = mongoose.model('Payroll', payrollSchema); 