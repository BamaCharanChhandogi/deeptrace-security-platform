const AppError = require('../utils/AppError');

/**
 * Role-Based Access Control (RBAC) middleware
 * @param  {...string} allowedRoles - Array of roles allowed (e.g. 'ADMIN', 'MANAGER')
 */
function authorize(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return next(AppError.unauthorized('User not authenticated'));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(
        AppError.forbidden(
          `Access denied: Action requires one of [${allowedRoles.join(', ')}] roles. Your role is '${req.user.role}'.`
        )
      );
    }

    next();
  };
}

module.exports = authorize;
