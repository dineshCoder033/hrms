const mongoose = require('mongoose');

let isConnected = false;

const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/hrms';
  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 3000,
    });
    isConnected = true;
    console.log(`[TaskOrbit HRMS] MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    isConnected = false;
    console.warn(`[TaskOrbit HRMS] Local MongoDB not detected (${error.message}).`);
    console.warn(`[TaskOrbit HRMS] Falling back gracefully to High-Performance In-Memory DB Mode.`);
  }
};

const getIsConnected = () => isConnected;

module.exports = { connectDB, getIsConnected };
