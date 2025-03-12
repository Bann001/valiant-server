const mongoose = require('mongoose');
const Vessel = require('../models/Vessel');
require('dotenv').config();

const sampleVessels = [
  {
    vesselId: 'VSL-001',
    vesselName: 'Valiant',
    imo: '123456',
    deliveryDate: '2022-06-18',
    registrationDate: '2022-06-19',
    status: 'Active',
    capacity: 5000,
    type: 'Cargo',
    flag: 'Philippines'
  },
  {
    vesselId: 'VSL-002',
    vesselName: 'Voyager',
    imo: '456789',
    deliveryDate: '2022-07-22',
    registrationDate: '2022-07-25',
    status: 'Active',
    capacity: 7500,
    type: 'Container',
    flag: 'Philippines'
  },
  {
    vesselId: 'VSL-003',
    vesselName: 'Victory',
    imo: '789012',
    deliveryDate: '2022-08-15',
    registrationDate: '2022-08-20',
    status: 'Maintenance',
    capacity: 6000,
    type: 'Bulk Carrier',
    flag: 'Philippines'
  }
];

const initializeVessels = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB...');

    // Clear existing vessels
    await Vessel.deleteMany({});
    console.log('Cleared existing vessels...');

    // Insert sample vessels
    const vessels = await Vessel.insertMany(sampleVessels);
    console.log('Sample vessels inserted:', vessels);

    console.log('Vessels initialization completed successfully!');
  } catch (error) {
    console.error('Error initializing vessels:', error);
  } finally {
    // Close the connection
    await mongoose.connection.close();
    console.log('MongoDB connection closed.');
  }
};

// Run the initialization
initializeVessels(); 