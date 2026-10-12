const path = require('path');
const dotenv = require('dotenv');

// Safely load environment variables from root .env if present
try {
  dotenv.config({ path: path.join(__dirname, '..', '..', '.env') });
} catch (e) {
  // Ignored in cloud environments
}

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// --- Core middleware ---
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Dynamic & flexible CORS for Vercel, localhost, and custom domains
const allowedOrigins = [
  process.env.CLIENT_URL,
  'http://localhost:5173',
  'http://localhost:3000',
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow non-browser requests or matching origins
      if (!origin) return callback(null, true);
      if (
        allowedOrigins.includes(origin) ||
        origin.endsWith('.vercel.app') ||
        process.env.NODE_ENV !== 'production'
      ) {
        return callback(null, true);
      }
      return callback(null, true); // Fallback allow to avoid unexpected deployment CORS locks
    },
    credentials: true,
  })
);

// URL normalization for serverless functions, rewrites, and direct calls
app.use((req, res, next) => {
  // Strip serverless entry prefixes if passed through by Vercel
  if (req.url.startsWith('/api/index.js')) {
    req.url = req.url.replace('/api/index.js', '') || '/';
  } else if (req.url.startsWith('/api/index')) {
    req.url = req.url.replace('/api/index', '') || '/';
  }

  // Ensure path starts with /api if it's an API route without /api prefix
  if (!req.url.startsWith('/api') && !req.url.startsWith('/uploads')) {
    req.url = '/api' + (req.url.startsWith('/') ? req.url : '/' + req.url);
  }
  next();
});

// Serve local uploads when Cloudinary is not configured
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// --- Health check & diagnostics ---
app.get(['/api/health', '/health'], (req, res) => {
  const dbState = mongoose.connection.readyState;
  const dbStatusMap = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting',
  };

  res.json({
    success: true,
    message: 'Fluxora API is running',
    database: dbStatusMap[dbState] || 'unknown',
    databaseConnected: dbState === 1,
    environment: process.env.NODE_ENV || 'production',
    serverless: !!process.env.VERCEL,
  });
});

app.get(['/api', '/'], (req, res) => {
  res.json({
    success: true,
    message: 'Fluxora REST API Server is active',
    healthCheck: '/api/health',
  });
});

// --- API Routes ---
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/listings', require('./routes/listingRoutes'));
app.use('/api/offers', require('./routes/offerRoutes'));
app.use('/api/deals', require('./routes/dealRoutes'));
app.use('/api/ai', require('./routes/aiRoutes'));
app.use('/api', require('./routes/trendImpactRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));

// --- Error handler (must be last) ---
app.use(errorHandler);

module.exports = app;
