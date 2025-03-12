const User = require('../models/User');
const bcrypt = require('bcryptjs');

const createAdminUser = async () => {
  try {
    // Check if admin already exists
    const adminExists = await User.findOne({ email: 'admin@valiant.com' });
    
    if (adminExists) {
      console.log('Admin user already exists');
      return;
    }

    // Create admin user
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@valiant.com',
      password: 'admin123',  // Password will be hashed by the User model pre-save middleware
      role: 'admin'
    });

    console.log('Admin user created successfully');
    return admin;
  } catch (error) {
    console.error('Error creating admin user:', error);
    process.exit(1);
  }
};

module.exports = createAdminUser; 