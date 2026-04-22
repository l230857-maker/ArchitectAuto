const express = require('express');

const createAuthRouter = (authController) => {
  const router = express.Router();

  router.post('/signup', authController.signUp);
  router.post('/signin', authController.signIn);

  return router;
};

module.exports = createAuthRouter;
