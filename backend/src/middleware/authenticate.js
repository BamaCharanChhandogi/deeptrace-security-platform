const jwt = require('jsonwebtoken');
const env = require('../config/environment');
const AppError = require('../utils/AppError');
const db = require('../config/database');

/**
 * Authentication middleware verifying Bearer JWT and binding verified tenant user context to req.user
 */
async function authenticate(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw AppError.unauthorized('Authentication token missing or malformed', 'TOKEN_MISSING');
    }

    const token = authHeader.split(' ')[1];
    let decoded;

    try {
      decoded = jwt.verify(token, env.JWT_SECRET);
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        throw AppError.unauthorized('Authentication token has expired', 'TOKEN_EXPIRED');
      }
      throw AppError.unauthorized('Invalid authentication token', 'TOKEN_INVALID');
    }

    // Verify user exists and is active in database
    const user = await db('users')
      .where({ id: decoded.id, tenant_id: decoded.tenantId, is_active: true })
      .first();

    if (!user) {
      throw AppError.unauthorized('User not found or account deactivated', 'USER_INACTIVE');
    }

    // Bind authenticated context securely
    req.user = {
      id: user.id,
      tenantId: user.tenant_id,
      role: user.role,
      email: user.email,
      name: user.name
    };

    next();
  } catch (error) {
    next(error);
  }
}

module.exports = authenticate;
