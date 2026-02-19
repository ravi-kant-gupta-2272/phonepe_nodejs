import axios from "axios";
import prisma from '../../config/prismaClient.js'
import catchAsync from '../../utils/catchAsync.js';
import AppError from '../../utils/app.error.js';
import {Environment, MERCHANT_ERROR_MESSAGES, SUCCESS_MESSAGE} from '../../utils/app.constant.js'
import {phonePeConfigSchema, userIdSchema, merchantIdSchema} from "../../utils/zod_validator/merchant_validator.js"


//***** Use the callback URL to send the merchant ID to the app server Method. *****/
const syncWithServer = ({merchantId, callbackUrl, action}:{merchantId:number, callbackUrl:string, action: string}) =>{
  (async()=>{
    console.log("SYNCWITHSERVER DATA ==== "+merchantId+action);
    const data = new URLSearchParams({
      merchant_id: merchantId.toString(),
      action: `${action}_merchant`
    });

    try {
      const response = await axios.post(
        callbackUrl,
        data,
        {
          headers: {
            "Content-Type": "application/json",
          },
          timeout: 30000,
          timeoutErrorMessage: "Server TimeOut"
        }
      );
      
      if(response.data.status === true){
        await prisma.merchant.update({
          where: { id:  merchantId},
          data: {
            is_send: true
          },
        });
      }
    }catch(e){
      console.log(e);
    }
  })
}

// ***** GET MERCHANT CONTROLLER ***** //
export const getMerchantAccount = catchAsync(async(req, res) => {
  const queryLimit = req.query.limit as string;
  const querySkip = req.query.skip as string;

   const limitParse = parseInt(queryLimit, 10);
  const skipParse = parseInt(querySkip, 10) ?? 0;

  const {userId} = userIdSchema.parse({userId: req.userId});
 
  const limit = Number.isNaN(limitParse) ? 5 : limitParse;
  const skip = Number.isNaN(skipParse) ? 0 : skipParse;

  const merchants = await prisma.merchant.findMany({
    where: {
      created_by: userId,
    },
    take: limit,
    skip: skip,
  });
 
  const total = await prisma.merchant.count({
    where: {
      created_by: userId,
    },
  });

  res.status(200).json({
    success: true,
    count: total,
    data: merchants || [],
  });
})

// ***** ADD MERCHANT CONTROLLER ***** //
export const createMerchantAccount = catchAsync(async (req, res) => {
  
  const {
    name,
    callbackUrl,
    // webhookUsername,
    // webhookPassword,
    clientId,
    clientVersion,
    clientSecret,
    environment,
    merchantId,
  } = phonePeConfigSchema.parse(req.body);

  const {userId} = userIdSchema.parse({userId: req.userId});

  const createdBy = userId;

  try {
    new URL(callbackUrl);
  } catch {
    throw new AppError(MERCHANT_ERROR_MESSAGES.INVALID_CALLBACKURL, 400);
  }
  
  const allowedEnvs = Object.values(Environment);
  const normalizedEnv = environment.toUpperCase() as "SANDBOX" | "PRODUCTION";
  
  if (!allowedEnvs.includes(normalizedEnv)) {
    throw new AppError(
      MERCHANT_ERROR_MESSAGES.ENVIRONMENT_INVALID,
      400
    );
  }

  const merchant = await prisma.merchant.create({
    data: {
      name: name,
      callback_url: callbackUrl,
      webhook_username: "",
      webhook_password: "",
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

  // TODO: Send Merchant Id to App Srver through the callbackurl
  syncWithServer({merchantId: merchant.id, callbackUrl, action: "create"});
  
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

  const { id } = merchantIdSchema.parse({id: Number(req.params.id)});

  const {userId} = userIdSchema.parse({userId: req.userId});

  const {
    name,
    callbackUrl,
    // webhookUsername,
    // webhookPassword,
    clientId,
    clientVersion,
    clientSecret,
    environment,
    merchantId
  } = phonePeConfigSchema.parse(req.body);

  try {
    new URL(callbackUrl);
  } catch {
    throw new AppError(MERCHANT_ERROR_MESSAGES.INVALID_CALLBACKURL, 400);
  }
  
  const allowedEnvs = Object.values(Environment);
  const normalizedEnv = environment.toUpperCase() as "SANDBOX" | "PRODUCTION";
  
  if (!allowedEnvs.includes(normalizedEnv)) {
    throw new AppError(
      MERCHANT_ERROR_MESSAGES.ENVIRONMENT_INVALID,
      400
    );
  }

  const merchant = await prisma.merchant.update({
    where: { id:  id},
    data: {
      name: name,
      callback_url: callbackUrl,
      webhook_username: "",
      webhook_password: "",
      client_id: clientId,
      client_version: clientVersion,
      client_secret: clientSecret,
      merchant_id: merchantId,
      environment: normalizedEnv,
      created_by: userId
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
  const { id } = merchantIdSchema.parse({id: Number(req.params.id)});

  const result = await prisma.merchant.delete({
    where: { id: id },
  });

  if(Object.keys(result).length === 0) {
    throw new AppError(MERCHANT_ERROR_MESSAGES.MERCHANT_NOT_FOUND, 500);
  }

  // TODO: Send Deleted Merchant Id to App Srver through the callbackurl
  syncWithServer({merchantId: id, callbackUrl: result.callback_url, action: "delete"});

  res.status(200).json({
    success: true,
    message: SUCCESS_MESSAGE.MERCHANT_DELETED_SUCCESSFULLY,
  });
})

