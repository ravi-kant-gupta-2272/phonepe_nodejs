import jwt from 'jsonwebtoken';
import prisma from '../config/prismaClient.js';
import config from '../config/config.js';
import AppError from '../utils/app.error.js'
import catchAsync from '../utils/catchAsync.js';
import {AUTH_ERROR_MESSAGES} from "../utils/app.constant.js"

const authController = catchAsync(async (req, res, next) => {
  
  // Get token from header
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new AppError(AUTH_ERROR_MESSAGES.TOKEN_MISSING, 400);
  }

  const token = authHeader.split(' ')[1];
  // Verify JWT signature
  const decoded = jwt.verify(token, config.jwt);

  // Check user exists in DB
  const user = await prisma.user.findFirst({
    where: { id: decoded.userId },
    select: {
      id: true
    },
  });
  
  if (!user) {
    throw new AppError(AUTH_ERROR_MESSAGES.INVALID_TOKEN, 401);
  }
  req.userId = decoded.userId;
  next();
});

export default  authController;