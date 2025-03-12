const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Define a simple user schema for this script
const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  role: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const User = mongoose.model('User', userSchema);

const createAdminUser = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB...');

    // Check if admin user already exists
    const adminExists = await User.findOne({ email: 'admin@valiant.com' });

    if (adminExists) {
      console.log('Admin user already exists, updating password...');
      
      // Hash the password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('admin123', salt);
      
      // Update the admin user's password
      await User.findOneAndUpdate(
        { email: 'admin@valiant.com' },
        { password: hashedPassword }
      );
      
      console.log('Admin password updated successfully!');
    } else {
      // Hash the password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('admin123', salt);
      
      // Create admin user
      const admin = await User.create({
        name: 'Admin User',
        email: 'admin@valiant.com',
        password: hashedPassword,
        role: 'admin'
      });

      console.log('Admin user created:', admin);
    }

    console.log('Admin user setup completed successfully!');
  } catch (error) {
    console.error('Error setting up admin user:', error);
  } finally {
    // Close the connection
    await mongoose.connection.close();
    console.log('MongoDB connection closed.');
  }
};

// Run the function
createAdminUser(); 