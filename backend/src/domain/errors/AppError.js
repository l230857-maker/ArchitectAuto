const createAppError = (message, statusCode = 500, details = null) => {
  const error = new Error(message);
  error.name = 'AppError';
  error.statusCode = statusCode;
  error.details = details;
  return error;
};

module.exports = createAppError;
