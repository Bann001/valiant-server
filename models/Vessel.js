const mongoose = require('mongoose');

const vesselSchema = new mongoose.Schema({
  vesselId: {
    type: String,
    required: [true, 'Vessel ID is required'],
    unique: true,
    trim: true
  },
  vesselName: {
    type: String,
    required: [true, 'Vessel name is required'],
    trim: true
  },
  imo: {
    type: String,
    required: [true, 'IMO number is required'],
    unique: true,
    trim: true
  },
  deliveryDate: {
    type: Date,
    required: [true, 'Delivery date is required']
  },
  registrationDate: {
    type: Date,
    required: [true, 'Registration date is required']
  },
  status: {
    type: String,
    enum: ['Active', 'Maintenance', 'Retired'],
    default: 'Active'
  },
  capacity: {
    type: Number,
    required: [true, 'Capacity is required']
  },
  type: {
    type: String,
    required: [true, 'Vessel type is required'],
    enum: ['Cargo', 'Container', 'Tanker', 'Bulk Carrier', 'Other']
  },
  flag: {
    type: String,
    required: [true, 'Flag is required']
  },
  assignedEmployees: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee'
  }]
}, {
  timestamps: true,
  collection: 'vessels'
});

module.exports = mongoose.model('Vessel', vesselSchema); 