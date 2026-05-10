const AppError = require('../../../domain/errors/AppError');

const createAuthMiddleware = (tokenService) => (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next(AppError('No token provided', 401));
    }

    const token = authHeader.slice(7);
    const decoded = tokenService.verify(token);
    req.userId = decoded.sub;
    next();
  } catch (error) {
    next(AppError('Invalid or expired token', 401));
  }
};

module.exports = createAuthMiddleware;
