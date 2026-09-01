import { AppError } from '../utils/errors.js';

export function errorHandler(err, req, res, next) {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      error: { code: err.code, message: err.message },
    });
  }

  // Joi validation error
  if (err.isJoi) {
    return res.status(400).json({
      error: { code: 'VALIDATION_ERROR', message: err.details[0].message },
    });
  }

  // Sequelize unique constraint
  if (err.name === 'SequelizeUniqueConstraintError') {
    const field = err.errors[0].path;
    return res.status(409).json({
      error: { code: 'DUPLICATE', message: `${field} already exists` },
    });
  }

  // Sequelize validation error
  if (err.name === 'SequelizeValidationError') {
    return res.status(400).json({
      error: { code: 'VALIDATION_ERROR', message: err.errors[0].message },
    });
  }

  // Unknown error
  console.error('Unhandled error:', err);
  res.status(500).json({
    error: { code: 'INTERNAL_ERROR', message: 'Internal server error' },
  });
}
