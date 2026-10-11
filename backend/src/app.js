const express = require('express');
const cors = require('cors');
const path = require('path');
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

// Serve local uploads when Cloudinary is not configured
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// --- Health check ---
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'Fluxora API is running' });
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
