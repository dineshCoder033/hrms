const mongoose = require('mongoose');
const env = require('./env');

/**
 * Connect to MongoDB with production-grade configurations.
 * If connection fails, the process exits with status code 1.
 * Server listening ONLY occurs after this resolves successfully.
 */
const connectDB = async () => {
  const uri = env.MONGODB_URI;

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 15000,
      autoIndex: env.NODE_ENV !== 'production',
      maxPoolSize: 20, // Connection pool for concurrent requests
      minPoolSize: 5,  // Keep 5 warm connections active to avoid TLS reconnection lag
      socketTimeoutMS: 45000,
      heartbeatFrequencyMS: 10000
    });

    console.log(`Database connected 🌳`);

    // Listen for disconnections after initial startup
    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️ [TaskOrbit HRMS] MongoDB connection lost! Retrying...');
    });

    mongoose.connection.on('error', (err) => {
      console.error('❌ [TaskOrbit HRMS] MongoDB connection error:', err.message);
    });

    return conn;
  } catch (error) {
    console.error(`===============================================`);
    console.error(`❌ [TaskOrbit HRMS] CRITICAL: MongoDB connection failed!`);
    console.error(`Reason: ${error.message}`);
    console.error(`Server cannot start without a valid MongoDB connection.`);
    console.error(`===============================================`);
    process.exit(1);
  }
};

module.exports = { connectDB };
