const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Connected...');
  } catch (err) {
    console.error('Error connecting to MongoDB:', err.message);
    process.exit(1);
  }
};

const resetAdminPassword = async () => {
  try {
    // Connect to MongoDB
    await connectDB();

    // Define a simple user schema for this script
    const userSchema = new mongoose.Schema({
      name: String,
      email: String,
      password: String,
      role: String
    });

    // Create a model from the schema
    const User = mongoose.model('User', userSchema);

    // Find the admin user
    const admin = await User.findOne({ email: 'admin@valiant.com' });

    if (!admin) {
      console.log('Admin user not found. Creating new admin user...');
      
      // Hash the password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('admin123', salt);
      
      // Create admin user
      const newAdmin = await User.create({
        name: 'Admin User',
        email: 'admin@valiant.com',
        password: hashedPassword,
        role: 'admin'
      });
      
      console.log('Admin user created:', {
        id: newAdmin._id,
        email: newAdmin.email,
        role: newAdmin.role
      });
    } else {
      console.log('Admin user found. Resetting password...');
      
      // Hash the password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('admin123', salt);
      
      // Update the admin user's password
      admin.password = hashedPassword;
      await admin.save();
      
      console.log('Admin password reset successfully!');
      console.log('New password hash:', hashedPassword);
    }
  } catch (error) {
    console.error('Error resetting admin password:', error);
  } finally {
    // Close the connection
    await mongoose.connection.close();
    console.log('MongoDB connection closed.');
  }
};

// Run the function
resetAdminPassword(); 