const mongoose = require('mongoose');

const ATLAS_FALLBACK_URI =
  'mongodb+srv://anshchadaniya_db_user:JIS1tdBQzA7t110j@c1.sy5o1pf.mongodb.net/fluxora?retryWrites=true&w=majority&appName=c1';

let cachedPromise = null;

const connectDB = async () => {
  // If already connected, reuse existing connection immediately
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  const primaryUri =
    process.env.MONGO_URI ||
    (process.env.VERCEL ? ATLAS_FALLBACK_URI : 'mongodb://localhost:27017/fluxora');

  if (!cachedPromise) {
    const opts = {
      bufferCommands: false, // Prevent infinite query buffering timeouts
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 10000,
    };

    cachedPromise = mongoose
      .connect(primaryUri, opts)
      .then((conn) => {
        console.log(`[MongoDB] Connected: ${conn.connection.host}`);
        return conn;
      })
      .catch(async (error) => {
        cachedPromise = null;
        console.warn(`[MongoDB Warning] Connection to ${primaryUri} failed: ${error.message}`);

        // If custom or local URI failed, auto-attempt Atlas fallback
        if (primaryUri !== ATLAS_FALLBACK_URI) {
          try {
            console.log('[MongoDB] Auto-connecting to fallback MongoDB Atlas cluster...');
            const fallbackConn = await mongoose.connect(ATLAS_FALLBACK_URI, {
              bufferCommands: false,
              serverSelectionTimeoutMS: 5000,
            });
            console.log(`[MongoDB] Connected to Atlas: ${fallbackConn.connection.host}`);
            return fallbackConn;
          } catch (fallbackError) {
            console.error(`[MongoDB Error] Fallback Atlas connection also failed: ${fallbackError.message}`);
            throw fallbackError;
          }
        }
        throw error;
      });
  }

  try {
    await cachedPromise;
    return mongoose.connection;
  } catch (err) {
    cachedPromise = null;
    throw err;
  }
};

module.exports = connectDB;
