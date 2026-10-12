const mongoose = require('mongoose');

// Direct replica set connection string - completely bypasses DNS SRV & TXT lookup timeouts on Vercel/serverless
const ATLAS_DIRECT_URI =
  'mongodb://anshchadaniya_db_user:JIS1tdBQzA7t110j@ac-uumfniv-shard-00-00.sy5o1pf.mongodb.net:27017,ac-uumfniv-shard-00-01.sy5o1pf.mongodb.net:27017,ac-uumfniv-shard-00-02.sy5o1pf.mongodb.net:27017/fluxora?ssl=true&replicaSet=atlas-rv5whq-shard-0&authSource=admin&retryWrites=true&w=majority';

let cachedPromise = null;

const connectDB = async () => {
  // If already connected, reuse existing connection immediately
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  // On Vercel / serverless, prefer direct replica set URI to eliminate SRV DNS lookup timeouts
  let primaryUri = process.env.MONGO_URI;
  if (!primaryUri) {
    primaryUri = process.env.VERCEL ? ATLAS_DIRECT_URI : 'mongodb://localhost:27017/fluxora';
  } else if (process.env.VERCEL && primaryUri.includes('c1.sy5o1pf.mongodb.net')) {
    // If the srv URI was configured in Vercel env, upgrade to direct URI to prevent DNS timeouts
    primaryUri = ATLAS_DIRECT_URI;
  }

  if (!cachedPromise) {
    const opts = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 8000,
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
        console.warn(`[MongoDB Warning] Primary connection failed: ${error.message}`);

        // If primary wasn't the direct Atlas URI, retry with direct Atlas URI
        if (primaryUri !== ATLAS_DIRECT_URI) {
          try {
            console.log('[MongoDB] Retrying with direct MongoDB Atlas replica set URI...');
            const fallbackConn = await mongoose.connect(ATLAS_DIRECT_URI, {
              bufferCommands: false,
              serverSelectionTimeoutMS: 8000,
            });
            console.log(`[MongoDB] Connected to direct Atlas: ${fallbackConn.connection.host}`);
            return fallbackConn;
          } catch (fallbackError) {
            console.error(`[MongoDB Error] Fallback connection also failed: ${fallbackError.message}`);
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
