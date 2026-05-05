/**
 * Central Express error-handling middleware.
 * Must be registered LAST (after all routes).
 *
 * Handles:
 *  - Mongoose CastError      → 400 (bad ObjectId)
 *  - Mongoose ValidationError → 400 (schema validation failed)
 *  - Mongoose duplicate key   → 409
 *  - Everything else          → 500
 */
const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message    = err.message    || 'Internal Server Error';

  // Log in development
  if (process.env.NODE_ENV === 'development') {
    console.error(`[ERROR] ${req.method} ${req.originalUrl} →`, err);
  }

  // Mongoose bad ObjectId  (e.g. /api/transactions/not-an-id)
  if (err.name === 'CastError') {
    statusCode = 400;
    message    = `Invalid ${err.path}: ${err.value}`;
  }

  // Mongoose validation errors  (required fields, enum, min, etc.)
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message    = Object.values(err.errors)
      .map((e) => e.message)
      .join(', ');
  }

  // MongoDB duplicate key  (unique index violation)
  if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyValue)[0];
    message    = `Duplicate value for field: ${field}`;
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

module.exports = errorHandler;
