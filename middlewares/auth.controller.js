import jwt from 'jsonwebtoken';
import prisma from '../config/prismaClient.js';
import AppError from '../utils/app.error.js'

const authController = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next(
        new AppError('Access denied. Token missing', 401)
      );
    }

    const token = authHeader.split(' ')[1];

    // Verify JWT signature
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Manual expiry check (extra safety)
    const currentTime = Math.floor(Date.now() / 1000);
    if (decoded.exp < currentTime) {
        return next(
            new AppError('Token expired', 401)
        );
    }

    // Check user exists in DB
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        email: true
      },
    });

    if (!user) {
      return next(
        new AppError('User not found', 401)
      );
    }

    next();
  } catch (error) {
    return next(
      new AppError(error.message || 'Authentication failed', 401)
    );
  }
};

export default  authController;

