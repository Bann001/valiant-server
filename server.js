const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const multer = require('multer');

// Load env vars
dotenv.config();

const app = express();

// Enable CORS - Before any routes
app.use(cors({
  origin: true, // Allow all origins during development
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization']
}));

// Body parser
app.use(express.json());

// Add MIME type headers
app.use((req, res, next) => {
  if (req.url.endsWith('.js')) {
    res.setHeader('Content-Type', 'application/javascript');
  } else if (req.url.endsWith('.jsx')) {
    res.setHeader('Content-Type', 'application/javascript');
  } else if (req.url.endsWith('.mjs')) {
    res.setHeader('Content-Type', 'application/javascript');
  }
  next();
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// File upload middleware
const upload = multer({ dest: 'uploads/' });

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const employeeRoutes = require('./routes/employees');
const departmentRoutes = require('./routes/departments');
const attendanceRoutes = require('./routes/attendance');
const dashboardRoutes = require('./routes/dashboard');
const vesselRoutes = require('./routes/vessels');
const payrollRoutes = require('./routes/payroll');
const reportRoutes = require('./routes/reports');

// Connect to MongoDB
const connectDB = async () => {
  try {
    console.log('Attempting to connect to MongoDB...');
    
    // Use MONGODB_URI from environment if available, otherwise construct it
    const MONGODB_URI = process.env.MONGODB_URI || `mongodb://root:${process.env.MONGODB_PASSWORD}@vk4k4s04wcocgc8kkwo84k00.88.198.171.23.sslip.io:55432/valiant?authSource=admin`;
    console.log('MongoDB Connection String (without password):', MONGODB_URI.replace(/(?<=:\/\/.+:).+(?=@)/, '****'));
    
    const conn = await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 45000,
      family: 4,
      retryWrites: true,
      w: 'majority'
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);
    console.log('Database name:', conn.connection.name);
    console.log('Connection state:', conn.connection.readyState);
    console.log('MongoDB connection options:', conn.connection.getOptions());

    // Add connection error handlers
    mongoose.connection.on('error', err => {
      console.error('MongoDB connection error:', err);
      console.error('Error details:', {
        name: err.name,
        message: err.message,
        code: err.code,
        state: mongoose.connection.readyState,
        host: mongoose.connection.host,
        port: mongoose.connection.port
      });
    });

    mongoose.connection.on('disconnected', () => {
      console.log('MongoDB disconnected. Attempting to reconnect...');
      // Attempt to reconnect
      setTimeout(() => {
        console.log('Attempting to reconnect to MongoDB...');
        connectDB();
      }, 5000);
    });

    mongoose.connection.on('reconnected', () => {
      console.log('MongoDB reconnected successfully');
    });

  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    console.error('Full error details:', {
      name: error.name,
      message: error.message,
      code: error.code,
      stack: error.stack,
      state: mongoose.connection ? mongoose.connection.readyState : 'No connection'
    });
    // Don't exit the process, just log the error
    console.error('MongoDB connection failed, but server will continue running');
  }
};

// Connect to database
connectDB();

// Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/vessels', vesselRoutes);
app.use('/api/payroll', payrollRoutes);
app.use('/api/reports', reportRoutes);

// Route for testing the server
app.get('/', (req, res) => {
  res.json({ message: 'Valiant API Server' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: 'Server Error' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});