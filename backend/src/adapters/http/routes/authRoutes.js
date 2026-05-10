const express = require('express');

const createAuthRouter = (authController, authMiddleware) => {
  const router = express.Router();

  router.post('/signup', authController.signUp);
  router.post('/signin', authController.signIn);
  router.post('/change-password', authMiddleware, authController.changePassword);
  router.delete('/delete-account', authMiddleware, authController.deleteAccount);

  return router;
};

module.exports = createAuthRouter;
