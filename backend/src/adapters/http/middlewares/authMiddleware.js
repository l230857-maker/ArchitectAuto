const createAppError = require('../../../domain/errors/AppError');

const createAuthMiddleware = (tokenService) => (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next(createAppError('No token provided', 401));
    }

    const token = authHeader.slice(7);
    const decoded = tokenService.verify(token);
    req.userId = decoded.userId;
    next();
  } catch (error) {
    next(createAppError('Invalid or expired token', 401));
  }
};

module.exports = createAuthMiddleware;
