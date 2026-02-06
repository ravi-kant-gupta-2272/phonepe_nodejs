import express from 'express';
import {
  registerUserController,
  loginUserController,
  resetUserPasswordController,
  refreshTokenController,
  resetPasswordLinkController,
  registerLinkController,
  tokenExpireStatusController
} from '../controllers/user/user.controller.js';
import {jwtExpireMiddleware} from '../middlewares/jwt.expire.middleware.js';

const userRouter = express.Router();

// Register user route
userRouter.post('/register', registerUserController);

// Login user route
userRouter.post('/login', loginUserController);

// Reset Password route
userRouter.post('/reset', jwtExpireMiddleware, resetUserPasswordController);

// Refresh token route
userRouter.post('/refresh-token', refreshTokenController);

// reset Password route
userRouter.post('/reset-link', resetPasswordLinkController);

// register link route
userRouter.post('/register-link', registerLinkController);

// Reset Password route
userRouter.get('/token-status', jwtExpireMiddleware, tokenExpireStatusController);

export default userRouter;
