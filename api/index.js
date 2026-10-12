const path = require('path');
const dotenv = require('dotenv');

// Safely load .env from root if available
try {
  dotenv.config({ path: path.join(__dirname, '..', '.env') });
} catch (e) {
  // Ignored in cloud environments
}

const app = require('../backend/src/app');
const connectDB = require('../backend/src/config/db');

module.exports = async (req, res) => {
  try {
    await connectDB();
  } catch (err) {
    console.error('[Vercel Serverless] Database connection failed:', err.message);
  }
  return app(req, res);
};
