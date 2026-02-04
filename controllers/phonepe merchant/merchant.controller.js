// import bcrypt from 'bcryptjs';
import prisma from '../../config/prismaClient.js'
import catchAsync from '../../utils/catchAsync.js';
import AppError from '../../utils/app.error.js';
import validateFields from '../../utils/validator.js';
import {Environment} from '../../utils/app.constant.js'

// ***** GET MERCHANT CONTROLLER ***** //
export const getMerchantAccount = catchAsync(async(req, res) => {
  const merchants = await prisma.merchant.findMany({
    where: {
      created_by: req.userId,
    },
  });

  res.status(200).json({
    success: true,
    count: merchants.length || 0,
    data: merchants || [],
  });
})

// ***** ADD MERCHANT CONTROLLER ***** //
export const addMerchantAccount = catchAsync(async (req, res) => {
  
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
      environment: normalizedEnv,
      created_by: createdBy,
    }
  });

  if(!merchant) throw new AppError(`Failed to Saved Data`,400);
  
  return res.status(201).json({
    status: 'success',
    data: {
      id: merchant.id,
      createdAt: merchant.createdAt,
      updatedAt: merchant.updatedAt,
    },
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
    data: {
      id: merchant.id,
      createdAt: merchant.createdAt,
      updatedAt: merchant.updatedAt,
    },
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

