const AppError = require('../utils/AppError');

/**
 * Zod schema validation middleware
 * @param {import('zod').ZodSchema} schema 
 * @param {'body' | 'query' | 'params'} source 
 */
function validate(schema, source = 'body') {
  return (req, res, next) => {
    const result = schema.safeParse(req[source]);
    if (!result.success) {
      const details = result.error.errors.map(err => ({
        field: err.path.join('.'),
        message: err.message
      }));
      return next(AppError.badRequest('Validation failed', 'VALIDATION_ERROR', details));
    }
    // Replace source with parsed & sanitized data
    req[source] = result.data;
    next();
  };
}

module.exports = validate;
