const { v4: uuidv4 } = require('uuid');

/**
 * Middleware to assign or forward an X-Request-Id correlation header
 */
function requestIdMiddleware(req, res, next) {
  const correlationId = req.headers['x-request-id'] || uuidv4();
  req.id = correlationId;
  res.setHeader('X-Request-Id', correlationId);
  next();
}

module.exports = requestIdMiddleware;
