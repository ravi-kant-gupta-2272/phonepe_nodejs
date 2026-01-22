import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../../config/prismaClient.js'
import AppError from '../../utils/app.error.js';
import Environment from '../../constants/merchant.environment.js'

export const addMerchantAccount = async (req, res, next) => {
  try {

    // Authenticate JWT
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError('Authorization token missing', 401);
    }

    const splitHeader = authHeader.split(' ');

    if(splitHeader[1] === undefined){
        throw new AppError('Token missing', 401);
    }

    const token = splitHeader[1];

    let payload;
    try {
      payload = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      throw new AppError('Invalid or expired token', 401);
    }

    const createdBy = payload.id || payload.userId;
    if (!createdBy) {
      throw new AppError('Invalid token payload', 401);
    }

    // Validate body
    const {
      name,
      callbackUrl,
      webhookUsername,
      webhookPassword,
      clientId,
      clientVersion,
      clientSecret,
      environment,
      merchantId
    } = req.body || {};

    if (!name || typeof name !== 'string') {
      throw new AppError('name is required', 400);
    }

    if (!callbackUrl || typeof callbackUrl !== 'string') {
      throw new AppError('callbackUrl is required', 400);
    }

    try {
      new URL(callbackUrl);
    } catch {
      throw new AppError('callbackUrl is not a valid URL', 400);
    }
    
    const requiredStrings = {
      webhookUsername,
      webhookPassword,
      clientId,
      clientSecret,
      environment,
      merchantId
    };
    
    for (const [key, val] of Object.entries(requiredStrings)) {
      if (!val || typeof val !== 'string') {
        throw new AppError(`${key} is required and must be a string`, 400);
      }
    }

    const allowedEnvs = Object.values(Environment);
    const normalizedEnv = environment.toUpperCase();
    
    if (!allowedEnvs.includes(normalizedEnv)) {
      throw new AppError(
        `environment must be one of: ${allowedEnvs.join(', ')}`,
        400
      );
    }

    // Hash sensitive fields
    const saltRounds = Number(process.env.BCRYPT_SALT_ROUNDS) || 12;

    const hashedWebhookUsername = await bcrypt.hash(webhookUsername, saltRounds);
    const hashedWebhookPassword = await bcrypt.hash(webhookPassword, saltRounds);
    const hashedClientSecret = await bcrypt.hash(clientSecret, saltRounds);

    const merchant = await prisma.merchant.create({
      data: {
        name: name,
        callback_url: callbackUrl,
        webhook_username: hashedWebhookUsername,
        webhook_password: hashedWebhookPassword,
        client_id: clientId,
        client_version: clientVersion,
        client_secret: hashedClientSecret,
        merchant_id: merchantId,
        environment: normalizedEnv, // must be Environment enum value
        created_by: createdBy,
      }
    });

    if(!merchant) throw new AppError(`Failed to Saved Data`,400);
    
    return res.status(201).json({
      status: 'success',
      data: merchant,
    });
  } catch (err) {
    next(err instanceof AppError ? err : new AppError(err.message, 500));
  }
};
