const { validationResult } = require('express-validator');

function handleValidationErrors(req, res, next) {
  const errors = validationResult(req);
  if (errors.isEmpty()) {
    return next();
  }

  const formatted = errors.array().map((error) => ({
    field: error.param,
    message: error.msg,
  }));

  return res.status(400).json({
    message: 'Validation failed',
    errors: formatted,
  });
}

module.exports = { handleValidationErrors };
