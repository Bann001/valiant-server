const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema({
  employeeId: {
    type: String,
    unique: true
  },
  firstName: {
    type: String,
    required: [true, 'First name is required']
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required']
  },
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department',
    required: [true, 'Department is required']
  },
  position: {
    type: String,
    required: [true, 'Position is required'],
    enum: ['Gangboss', 'Dock Checker', 'Delivery Checker', 'Stevedor', 'Arrastre', 'Forklift Optr', 'Signalman']
  },
  hireDate: {
    type: Date,
    default: Date.now
  },
  salary: {
    type: Number,
    required: [true, 'Salary is required']
  },
  status: {
    type: String,
    enum: ['Active', 'On Leave', 'Terminated'],
    default: 'Active'
  },
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  },
  emergencyContact: {
    name: String,
    relationship: String,
    phone: String
  },
  profileImage: String
}, {
  timestamps: true
});

// Auto-generate employeeId before saving a new document
employeeSchema.pre('save', async function (next) {
  if (!this.employeeId) {
    const lastEmployee = await this.constructor.findOne().sort({ employeeId: -1 });

    if (lastEmployee && lastEmployee.employeeId) {
      const lastIdNumber = parseInt(lastEmployee.employeeId.replace('EMP', ''), 10);
      this.employeeId = `EMP${String(lastIdNumber + 1).padStart(3, '0')}`;
    } else {
      this.employeeId = 'EMP001';
    }
  }

  next();
});

module.exports = mongoose.model('Employee', employeeSchema);
