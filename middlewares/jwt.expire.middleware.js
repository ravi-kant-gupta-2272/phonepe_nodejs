import jwt from 'jsonwebtoken';
import config from '../config/config.js';
import catchAsync from "../utils/catchAsync.js";

export const jwtExpireMiddleware = catchAsync(async (req, res, next) => {

    const marginTime = 60;

    const token = req.headers['authorization']?.split(' ')[1] || req.body.token;

    // Verify JWT signature
    const decoded = jwt.verify(token, config.jwt);

    // Expiry check with margin time
    const currentTime = Math.floor(Date.now() / 1000);

    const adjustedTime = currentTime - marginTime; // Subtract margin time from current time

    if (decoded.exp < adjustedTime) {
        return next(
            new AppError(AUTH_ERROR_MESSAGES.TOKEN_EXPIRED, 401)
        );
    }

    next();
});