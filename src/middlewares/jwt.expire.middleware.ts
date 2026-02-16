import jwt from 'jsonwebtoken';
import { z } from "zod";
import {Request, Response, NextFunction} from 'express'
import config from '../config/config.js';
import AppError from '../utils/app.error.js';
import catchAsync from "../utils/catchAsync.js";
import { AUTH_ERROR_MESSAGES } from '../utils/app.constant.js';

const tokenSchema = z.object({
  token: z.string().trim().nonempty({
    message: "Token must not be empty",
  }),
})


export const jwtExpireMiddleware = catchAsync(async (req: Request, res: Response, next: NextFunction) => {

    const marginTime = 60;

    const {token} = tokenSchema.parse({token:req.headers['authorization']?.split(' ')[1]});

    // Verify JWT signature
    const verified = jwt.verify(token, config.jwt);

    if (typeof verified === 'string') {
        throw new AppError(AUTH_ERROR_MESSAGES.INVALID_TOKEN, 401);
    }
    const decoded: jwt.JwtPayload = verified;

    // Expiry check with margin time
    const currentTime = Math.floor(Date.now() / 1000);

    const adjustedTime = currentTime - marginTime;

    if (decoded.exp! < adjustedTime) {
        throw new AppError(AUTH_ERROR_MESSAGES.TOKEN_EXPIRED, 401);
    }

    next();
});