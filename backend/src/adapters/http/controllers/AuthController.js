const createAuthController = ({ signUpUseCase, signInUseCase, changePasswordUseCase, deleteAccountUseCase }) => ({
  signUp: async (req, res, next) => {
    try {
      const result = await signUpUseCase.execute(req.body);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  },

  signIn: async (req, res, next) => {
    try {
      const result = await signInUseCase.execute(req.body);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },

  changePassword: async (req, res, next) => {
    try {
      const userId = req.userId;
      const { newPassword } = req.body;

      if (!userId) {
        return next(require('../../domain/errors/AppError')('User ID is required', 401));
      }

      const result = await changePasswordUseCase.execute({ userId, newPassword });
      res.status(200).json({
        success: true,
        message: result.message,
        data: result.user,
      });
    } catch (error) {
      next(error);
    }
  },

  deleteAccount: async (req, res, next) => {
    try {
      const userId = req.userId;
      const { password } = req.body;

      if (!userId) {
        return next(require('../../domain/errors/AppError')('User ID is required', 401));
      }

      if (!password) {
        return next(require('../../domain/errors/AppError')('Password is required', 400));
      }

      const result = await deleteAccountUseCase.execute({ userId, password });
      res.status(200).json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      next(error);
    }
  },
});

module.exports = createAuthController;
