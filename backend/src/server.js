const dotenv = require('dotenv');
dotenv.config({ path: require('path').join(__dirname, '..', '..', '.env') });

const http = require('http');
const app = require('./app');
const connectDB = require('./config/db');

const PORT = process.env.PORT || 5000;

// Connect to MongoDB then start the server in non-serverless/local environments
connectDB()
  .then(() => {
    if (!process.env.VERCEL) {
      const server = http.createServer(app);
      server.listen(PORT, () => {
        console.log(`Fluxora server running on http://localhost:${PORT}`);
      });
    }
  })
  .catch((err) => {
    console.error('Failed to connect to MongoDB on startup:', err.message);
    if (!process.env.VERCEL) {
      const server = http.createServer(app);
      server.listen(PORT, () => {
        console.log(`Fluxora server running on http://localhost:${PORT} (MongoDB reconnecting in background)`);
      });
    }
  });

module.exports = app;
