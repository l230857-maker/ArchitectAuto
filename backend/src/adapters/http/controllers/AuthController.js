const createAuthController = ({ signUpUseCase, signInUseCase }) => ({
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
});

module.exports = createAuthController;
