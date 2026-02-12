import prisma from '../../config/prismaClient.js'
import catchAsync from '../../utils/catchAsync.js';
import AppError from '../../utils/app.error.js';
import validateFields from '../../utils/validator.js';
import {Environment, MERCHANT_ERROR_MESSAGES, SUCCESS_MESSAGE} from '../../utils/app.constant.js'

// ***** GET MERCHANT CONTROLLER ***** //
export const getMerchantAccount = catchAsync(async(req, res) => {
  const userId =req.userId;

  if(userId) throw new AppError(MERCHANT_ERROR_MESSAGES.MERCHANT_NOT_FOUND, 400);

  const merchants = await prisma.merchant.findMany({
    where: {
      created_by: userId,
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

  // Validate callbackUrl
  validateFields(createdBy, "createdBy", 'number');

  // Validate callbackUrl
  // validateFields(clientVersion, "clientVersion", 'number');

  try {
    new URL(callbackUrl);
  } catch {
    throw new AppError(MERCHANT_ERROR_MESSAGES.INVALID_CALLBACKURL, 400);
  }
  
  const requiredStrings = {
    name,
    callbackUrl,
    webhookUsername,
    webhookPassword,
    clientId,
    clientSecret,
    environment,
    merchantId
  };
  
  for (const [key, val] of Object.entries(requiredStrings)) {
    validateFields(val, key, 'string');
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
    },
    select: {
      id: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if(!merchant) throw new AppError(MERCHANT_ERROR_MESSAGES.FAILED_TO_SAVE,500);
  
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
  // console.log("-=-=-=-=-=-=-")
  const { id } = req.params;
  const idNumber = Number(id);

  //Validate id
  validateFields(idNumber, "id", 'number');

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

  // Validate callbackUrl
  validateFields(createdBy, "createdBy", 'number');

  // Validate callbackUrl
  validateFields(clientVersion, "clientVersion", 'number');

  try {
    new URL(callbackUrl);
  } catch {
    throw new AppError(MERCHANT_ERROR_MESSAGES.INVALID_CALLBACKURL, 400);
  }
  
  const requiredStrings = {
    name,
    callbackUrl,
    webhookUsername,
    webhookPassword,
    clientId,
    clientSecret,
    environment,
    merchantId
  };
  
  for (const [key, val] of Object.entries(requiredStrings)) {
    validateFields(val, key, 'string');
  }

  const allowedEnvs = Object.values(Environment);
  const normalizedEnv = environment.toUpperCase();
  
  if (!allowedEnvs.includes(normalizedEnv)) {
    throw new AppError(
      MERCHANT_ERROR_MESSAGES.ENVIRONMENT_INVALID,
      400
    );
  }

  const merchant = await prisma.merchant.update({
    where: { id:  idNumber},
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
      created_by: createdBy
    },
  });

  if(Object.keys(merchant).length === 0) {
    throw new AppError(MERCHANT_ERROR_MESSAGES.MERCHANT_NOT_FOUND, 404);
  }

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
  
  const idNumber = Number(id);

  //Validate id
  validateFields(idNumber, "id", 'number');

  const result = await prisma.merchant.delete({
    where: { id: idNumber },
  });

  if(Object.keys(result).length === 0) {
    throw new AppError(MERCHANT_ERROR_MESSAGES.MERCHANT_NOT_FOUND, 500);
  }

  res.status(200).json({
    success: true,
    message: SUCCESS_MESSAGE.MERCHANT_DELETED_SUCCESSFULLY,
  });
})

