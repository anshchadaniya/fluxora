const mongoose = require('mongoose');

// Verified fallback Atlas cluster in case MONGO_URI is omitted in Vercel project settings
const ATLAS_FALLBACK_URI =
  'mongodb+srv://anshchadaniya_db_user:JIS1tdBQzA7t110j@c1.sy5o1pf.mongodb.net/fluxora?retryWrites=true&w=majority&appName=c1';

let cachedConnection = null;

// Connect to MongoDB (local or Atlas) with serverless connection reuse
const connectDB = async () => {
  // If already connected, reuse existing connection
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  // If currently connecting, wait for it to finish
  if (mongoose.connection.readyState === 2) {
    await new Promise((resolve) => {
      mongoose.connection.once('connected', resolve);
      mongoose.connection.once('error', resolve);
    });
    if (mongoose.connection.readyState === 1) {
      return mongoose.connection;
    }
  }

  // Determine target URI:
  // 1. Explicit MONGO_URI from environment
  // 2. If running on Vercel or cloud without MONGO_URI, default to Atlas cluster
  // 3. Otherwise try local MongoDB first
  const primaryUri =
    process.env.MONGO_URI ||
    (process.env.VERCEL ? ATLAS_FALLBACK_URI : 'mongodb://localhost:27017/fluxora');

  try {
    const conn = await mongoose.connect(primaryUri, {
      serverSelectionTimeoutMS: 6000,
    });
    console.log(`MongoDB connected: ${conn.connection.host}`);
    cachedConnection = conn;
    return conn;
  } catch (error) {
    console.warn(`[MongoDB Warning] Connection to ${primaryUri} failed: ${error.message}`);

    // If local or custom URI failed and it wasn't already the Atlas fallback, auto-retry Atlas
    if (primaryUri !== ATLAS_FALLBACK_URI) {
      try {
        console.log('[MongoDB] Auto-connecting to fallback MongoDB Atlas cluster...');
        const conn = await mongoose.connect(ATLAS_FALLBACK_URI, {
          serverSelectionTimeoutMS: 6000,
        });
        console.log(`Connected to fallback MongoDB Atlas: ${conn.connection.host}`);
        cachedConnection = conn;
        return conn;
      } catch (fallbackError) {
        console.error(`[MongoDB Error] Fallback Atlas connection also failed: ${fallbackError.message}`);
      }
    }

    throw error;
  }
};

module.exports = connectDB;
