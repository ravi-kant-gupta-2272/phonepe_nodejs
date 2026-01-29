import bcrypt from 'bcryptjs';
import prisma from '../../config/prismaClient.js'
import catchAsync from '../../utils/catchAsync.js';
import AppError from '../../utils/app.error.js';
import validateFields from '../../utils/validator.js';
import {Environment} from '../../utils/app.constant.js'

// ***** GET MERCHANT CONTROLLER ***** //
export const getMerchantAccount = catchAsync(async(req, res) => {
  const merchants = await prisma.merchant.findMany();

  res.status(200).json({
    success: true,
    count: merchants.length || 0,
    data: merchants || [],
  });
})

// ***** ADD MERCHANT CONTROLLER ***** //
export const addMerchantAccount = catchAsync(async (req, res) => {
  
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
    merchantId,
    createdBy
  } = req.body || {};

  // Handle name validation
  validateFields(name, 'name', 'string');

  // Handle callback validation
  validateFields(callbackUrl, 'name', 'string');

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

  // const hashedWebhookUsername = await bcrypt.hash(webhookUsername, saltRounds);
  // const hashedWebhookPassword = await bcrypt.hash(webhookPassword, saltRounds);
  // const hashedClientSecret = await bcrypt.hash(clientSecret, saltRounds);

  const merchant = await prisma.merchant.create({
    data: {
      name: name,
      callback_url: callbackUrl,
      webhook_username: webhookUsername,
      webhook_password: webhookPassword,
      client_id: clientId,
      client_version: clientVersion,
      client_secret: clientSecret,
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
});

// ***** UPDATE MERCHANT CONTROLLER ***** //
export const updateMerchantAccount = catchAsync(async(req, res) => {
  const { id } = req.params;

  const merchant = await prisma.merchant.update({
    where: { id: Number(id) },
    data: req.body,
  });

  res.status(200).json({
    success: true,
    data: merchant,
  });
})

// ***** DELETE MERCHANT CONTROLLER ***** //
export const deleteMerchantAccount = catchAsync(async(req, res) => {
  const { id } = req.params;

    await prisma.merchant.delete({
      where: { id: Number(id) },
    });

    res.status(200).json({
      success: true,
      message: 'Merchant deleted successfully',
    });
})

