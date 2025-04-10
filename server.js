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
  origin: ['http://o0soo4sg0k40s44k0ccwcksw.88.198.171.23.sslip.io', 'http://vk4k4s04wcocgc8kkwo84k00.88.198.171.23.sslip.io'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization']
}));

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Add security headers
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin && (
    origin === 'http://o0soo4sg0k40s44k0ccwcksw.88.198.171.23.sslip.io' || 
    origin === 'http://vk4k4s04wcocgc8kkwo84k00.88.198.171.23.sslip.io'
  )) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
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
    
    // Use internal MongoDB connection for Coolify
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://root:sx73lGozpnSKjlFhz50QlufgSqCxRLEwKvuc1Vjl59eWLsiceEGU37t9Ys5L9EjW@88.198.171.23:55432/?directConnection=true';
    
    // Log connection attempt (without sensitive data)
    const sanitizedUri = MONGODB_URI.replace(/(?<=:\/\/).+?(?=@)/, '****');
    console.log('Connecting to MongoDB:', sanitizedUri);
    
    const conn = await mongoose.connect(MONGODB_URI, {
      user: process.env.MONGODB_USER || 'root',
      pass: process.env.MONGODB_PASSWORD,
      authSource: process.env.MONGODB_AUTH_SOURCE || 'admin',
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 45000,
      family: 4
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);
    console.log('Database name:', conn.connection.name);
    console.log('Connection state:', conn.connection.readyState);

    // Add connection error handlers
    mongoose.connection.on('error', err => {
      console.error('MongoDB connection error:', err);
      console.error('Error details:', {
        name: err.name,
        message: err.message,
        code: err.code,
        state: mongoose.connection.readyState,
        host: mongoose.connection.host
      });
    });

    mongoose.connection.on('disconnected', () => {
      console.log('MongoDB disconnected. Attempting to reconnect...');
      setTimeout(connectDB, 5000); // Try to reconnect after 5 seconds
    });

  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    console.error('Full error details:', {
      name: error.name,
      message: error.message,
      code: error.code,
      stack: error.stack
    });
    // Don't exit the process, just log the error and try to reconnect
    console.error('MongoDB connection failed, attempting to reconnect in 5 seconds...');
    setTimeout(connectDB, 5000); // Try to reconnect after 5 seconds
  }
};

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
  console.error('Error:', err);
  console.error('Stack:', err.stack);
  res.status(err.status || 500).json({ 
    success: false, 
    message: err.message || 'Server Error',
    error: process.env.NODE_ENV === 'development' ? err : undefined
  });
});

// 404 handler - This should be after all valid routes
app.use((req, res) => {
  console.log('404 Not Found:', req.method, req.url);
  res.status(404).json({ 
    success: false, 
    message: `Route ${req.method} ${req.url} not found` 
  });
});

// Start server
const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || '0.0.0.0';

app.listen(PORT, HOST, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on http://${HOST}:${PORT}`);
  connectDB(); // Connect to MongoDB after server starts
});