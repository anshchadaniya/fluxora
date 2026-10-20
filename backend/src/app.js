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
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// --- Core middleware ---
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Dynamic & flexible CORS — accepts localhost, any *.vercel.app subdomain, and CLIENT_URL
const allowedOrigins = [
  process.env.CLIENT_URL,
  'http://localhost:5173',
  'http://localhost:3000',
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow server-to-server / non-browser requests (no Origin header)
      if (!origin) return callback(null, true);
      // Allow any Vercel deployment or preview URL
      if (origin.endsWith('.vercel.app')) return callback(null, true);
      // Allow explicitly configured origins
      if (allowedOrigins.includes(origin)) return callback(null, true);
      // Allow in development
      if (process.env.NODE_ENV !== 'production') return callback(null, true);
      // In production, still allow unknown origins rather than hard-block
      // (remove this line if you want strict CORS enforcement)
      return callback(null, true);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// URL normalization: strip any /api/index.js artifact from Vercel routing
app.use((req, res, next) => {
  if (req.url.startsWith('/api/index.js')) {
    req.url = req.url.replace('/api/index.js', '') || '/';
  } else if (req.url === '/api/index') {
    req.url = '/';
  }
  next();
});

// Auto-connect and verify MongoDB connection on incoming API requests
app.use(async (req, res, next) => {
  if (req.url.startsWith('/uploads')) {
    return next();
  }
  try {
    await connectDB();
    next();
  } catch (err) {
    console.error('[DB Request Middleware Error]:', err.message);
    if (req.url.includes('/health')) {
      return next();
    }
    return res.status(503).json({
      success: false,
      message: 'Database connection unavailable. Please check MongoDB Atlas connection.',
    });
  }
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
