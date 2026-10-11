const mongoose = require('mongoose');

// Connect to MongoDB (local or Atlas) with serverless connection reuse
const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) {
    return mongoose.connection;
  }

  const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/fluxora';
  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`MongoDB connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.warn(`[MongoDB Warning] Could not connect to ${uri} (${error.message}).`);
    console.warn(`Make sure MongoDB is running locally or provide a free MongoDB Atlas URI in .env.`);
  }
};

module.exports = connectDB;
