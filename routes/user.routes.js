import express from 'express';
import {
  registerUser,
  loginUser,
  resetUserPassword,
  refreshTokenController
} from '../controllers/user/user.controller.js';

const userRouter = express.Router();

// Register user route
userRouter.post('/register', registerUser);

// Login user route
userRouter.post('/login', loginUser);

// Reset Password route
userRouter.post('/reset', resetUserPassword);

// Refresh token route
userRouter.post('/refresh/token', refreshTokenController);

export default userRouter;
