const mongoose = require('mongoose');
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

// Load env vars
dotenv.config();

const createAdminUser = async () => {
  try {
    // Connect to MongoDB using environment variable
    const MONGODB_URI = process.env.MONGODB_URI || `mongodb://root:${process.env.MONGODB_PASSWORD}@vk4k4s04wcocgc8kkwo84k00.88.198.171.23.sslip.io:55432/valiant?authSource=admin`;
    
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    // Check if admin already exists
    const adminExists = await User.findOne({ email: 'admin@valiant.com' });
    
    if (adminExists) {
      console.log('Admin user already exists');
      return;
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('admin123', salt);

    // Create admin user
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@valiant.com',
      password: hashedPassword,
      role: 'admin'
    });

    console.log('Admin user created successfully:', admin.email);
  } catch (error) {
    console.error('Error creating admin user:', error);
  } finally {
    await mongoose.connection.close();
  }
};

// Run the function
createAdminUser(); 