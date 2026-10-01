const rateLimit = require('express-rate-limit');

/**
 * Strict rate limiter for authentication routes (login/refresh)
 * 10 requests per 1 minute window per IP
 */
const authRateLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      message: 'Too many authentication attempts. Please try again after 1 minute.',
      code: 'RATE_LIMIT_EXCEEDED'
    }
  }
});

/**
 * Standard API rate limiter for all general routes
 * 300 requests per 1 minute window
 */
const apiRateLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      message: 'API rate limit exceeded. Please throttle your requests.',
      code: 'RATE_LIMIT_EXCEEDED'
    }
  }
});

module.exports = {
  authRateLimiter,
  apiRateLimiter
};
