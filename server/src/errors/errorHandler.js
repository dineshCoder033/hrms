const { ZodError } = require('zod');
const ApiError = require('./ApiError');

const errorHandler = (err, req, res, next) => {
  let error = err;

  // Handle Zod Validation Errors
  if (err instanceof ZodError) {
    const issues = err.issues || err.errors || [];
    const errorDetails = issues.map(e => ({
      field: e.path.join('.'),
      message: e.message
    }));
    error = new ApiError(400, 'Validation failed', errorDetails);
  }
  // Handle Mongoose CastError (e.g. invalid ObjectId)
  else if (err.name === 'CastError') {
    error = new ApiError(400, `Invalid ${err.path}: ${err.value}`);
  }
  // Handle Mongoose ValidationError
  else if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map(val => val.message);
    error = new ApiError(400, messages.join(', '));
  }
  // Handle Mongoose Duplicate Key Error
  else if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0];
    error = new ApiError(409, `Duplicate value for ${field || 'field'}. Please use another value.`);
  }
  // Generic unhandled errors
  else if (!(err instanceof ApiError)) {
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Internal Server Error';
    error = new ApiError(statusCode, message, [], false, err.stack);
  }

  const response = {
    success: false,
    message: error.message,
    ...(error.errors?.length > 0 && { errors: error.errors }),
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
  };

  res.status(error.statusCode || 500).json(response);
};

module.exports = errorHandler;
