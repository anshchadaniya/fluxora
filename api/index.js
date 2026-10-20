const path = require('path');
const dotenv = require('dotenv');

// Safely load .env from root if available (local dev only)
try {
  dotenv.config({ path: path.join(__dirname, '..', '.env') });
} catch (e) {
  // Ignored in cloud environments — env vars are set in Vercel dashboard
}

const app = require('../backend/src/app');
const connectDB = require('../backend/src/config/db');

let dbConnected = false;

module.exports = async (req, res) => {
  // Connect to DB once and cache the connection across warm invocations
  if (!dbConnected) {
    try {
      await connectDB();
      dbConnected = true;
    } catch (err) {
      console.error('[Vercel Serverless] Database connection failed:', err.message);
      // Don't block request — app.js middleware will handle the 503 gracefully
    }
  }
  return app(req, res);
};
