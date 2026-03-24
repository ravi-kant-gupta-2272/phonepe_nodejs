import jwt from 'jsonwebtoken';
import { z } from "zod";
import { Request, Response, NextFunction } from 'express'
import config from '../config/config.js';
import catchAsync from "../utils/catchAsync.js";

const tokenSchema = z.object({
  token: z.string().trim().nonempty({
    message: "Token must not be empty",
  }),
});

export const jwtExpireMiddleware = catchAsync(async (req: Request, res: Response, next: NextFunction) => {

  const { token } = tokenSchema.parse({ token: req.headers['authorization']?.split(' ')[1] });

  // Verify JWT signature
  jwt.verify(token, config.jwt);

  next();
});