const AppError = require('../utils/AppError');
const logger = require('../utils/logger');
const env = require('../config/environment');

/**
 * Global error handling middleware
 */
function errorHandler(err, req, res, next) {
  let error = err;

  // Handle malformed JSON body
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    error = AppError.badRequest('Malformed JSON in request payload', 'INVALID_JSON');
  }

  // Handle PostgreSQL / Knex errors
  if (err.code) {
    switch (err.code) {
      case '23505': // Unique violation
        error = AppError.conflict('Resource with specified unique attributes already exists', 'DUPLICATE_ENTRY', {
          detail: err.detail
        });
        break;
      case '23503': // Foreign key violation
        error = AppError.badRequest('Referenced entity does not exist or relation is constrained', 'FOREIGN_KEY_VIOLATION', {
          detail: err.detail
        });
        break;
      case '22P02': // Invalid UUID syntax
        error = AppError.badRequest('Invalid UUID format provided in parameters', 'INVALID_UUID');
        break;
    }
  }

  // Fallback if not an AppError
  const statusCode = error.statusCode || 500;
  const errorCode = error.code || 'INTERNAL_SERVER_ERROR';
  const message = error.message || 'An unexpected internal server error occurred';

  // Log error with correlation ID
  if (statusCode >= 500) {
    logger.error('Unhandled Server Error: %s', message, {
      requestId: req.id,
      tenantId: req.user?.tenantId,
      url: req.originalUrl,
      method: req.method,
      stack: error.stack
    });
  } else {
    logger.warn('Client Error [%d %s]: %s', statusCode, errorCode, message, {
      requestId: req.id,
      tenantId: req.user?.tenantId,
      url: req.originalUrl
    });
  }

  res.status(statusCode).json({
    success: false,
    error: {
      message,
      code: errorCode,
      details: error.details || null,
      requestId: req.id,
      ...(env.NODE_ENV !== 'production' && statusCode >= 500 ? { stack: error.stack } : {})
    }
  });
}

module.exports = errorHandler;
