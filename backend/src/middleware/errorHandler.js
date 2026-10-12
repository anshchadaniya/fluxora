// Central error handler – returns consistent JSON shape
const errorHandler = (err, req, res, next) => {
  console.error('[Error Handler Stack]:', err.stack || err.message);

  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';

  // Mongoose validation error (e.g. invalid phone, missing required fields)
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = Object.values(err.errors || {})
      .map((val) => val.message)
      .join(', ');
  }

  // Mongoose duplicate key (e.g. email already exists)
  if (err.code === 11000) {
    statusCode = 400;
    message = 'This email address is already registered';
  }

  // MongoDB Atlas IP whitelist or network connection issue
  if (
    err.name === 'MongooseServerSelectionError' ||
    err.name === 'MongoNetworkError' ||
    err.name === 'MongoServerSelectionError' ||
    (err.message && err.message.includes('buffering timed out')) ||
    (err.message && err.message.includes('ECONNREFUSED'))
  ) {
    statusCode = 503;
    message =
      'Database connection failed. Please ensure MongoDB Atlas Network Access has 0.0.0.0/0 (Allow Access from Anywhere) enabled.';
  }

  res.status(statusCode).json({
    success: false,
    message,
    errorType: err.name,
    data: null,
  });
};

module.exports = errorHandler;
