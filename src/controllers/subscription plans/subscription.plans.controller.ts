import axios from "axios";
import { Prisma } from "../../generated/prisma/client.js";
import prisma from '../../config/prismaClient.js'
import catchAsync from '../../utils/catchAsync.js';
import AppError from '../../utils/app.error.js';
import { MERCHANT_ERROR_MESSAGES, SUCCESS_MESSAGE, SUBSCRIPTIONS_ERROR_MESSAGES } from '../../utils/app.constant.js';
import {createPlanSchema, updatePlanSchema, merchantIdSchema, subscriptionIdSchema} from '../../utils/zod_validator/subscription_validator.js'

//***** Use the callback URL to send the merchant ID to the app server Method. *****/
const syncWithServer = ({merchantId,SubscriptionId, callbackUrl, action}:{merchantId:number,SubscriptionId:number, callbackUrl:string, action: string}) =>{
  
  /// TODO: Send Data to App Server.

  // eslint-disable-next-line @typescript-eslint/no-unused-expressions
  (async()=>{
    const data = new URLSearchParams({
      merchant_id: merchantId.toString(),
      subscriptionId: SubscriptionId.toString(),
      action: `${action}_subscription`
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

// ***** CREATE Subscription Plan *****//
export const createSubscriptionPlan = catchAsync(async (req, res) => {
  const {
      merchant_id,
      plan_name,
      plan_type,
      amount,
      duration_days,
      billing_cycle_months,
      is_active = false,
    } = createPlanSchema.parse(req.body);

    const merchant = await prisma.merchant.findFirst({
      where: { id: merchant_id },
    });

    if (!merchant) {
      throw new AppError(MERCHANT_ERROR_MESSAGES.MERCHANT_NOT_FOUND, 404);
    }

    const plan = await prisma.subscriptionPlan.create({
      data: {
        merchant_id: merchant_id,
        plan_name,
        plan_type,
        amount: new Prisma.Decimal(amount),
        duration_days,
        billing_cycle_months,
        is_active,
      },
    });

    if(Object.keys(plan).length === 0){
      throw new AppError(SUBSCRIPTIONS_ERROR_MESSAGES.SUBSCRIPTIONS_CREATION_FAILED, 500);
    }

    // TODO: Send Merchant Id, Subscription Id and Correspondence Data to App Srver through the callbackurl
    syncWithServer({
      merchantId: merchant.id, 
      SubscriptionId: plan.id,
      callbackUrl: merchant.callback_url,
      action: "create"
    });

    res.status(201).json({
      success: true,
      data: {...plan,amount: plan.amount},
    });
});

// ***** GET Subscription Plans BY Merchant Id *****//
export const getPlansByMerchant = catchAsync(async (req, res) => {
  const { merchantId } = merchantIdSchema.parse({merchantId: Number(req.params.merchantId)});

    const plans = await prisma.subscriptionPlan.findMany({
      where: {
        merchant_id: merchantId,
      },
      orderBy: {
        created_at: 'desc',
      },
    });

    res.status(200).json({
      success: true,
      count: plans.length,
      data: plans,
    });
});

// ***** UPDATE Subscription Plan *****//
export const updateSubscriptionPlan = catchAsync(async (req, res) => {

  const {
    subscription_id,
    merchant_id,
    plan_name,
    plan_type,
    amount,
    duration_days,
    billing_cycle_months,
    is_active = true,
  } = updatePlanSchema.parse(req.body);
  
  const merchantId = merchant_id;

  const planExists = await prisma.subscriptionPlan.findUnique({
    where: {
      id: subscription_id,
    },
  });

  if (!planExists) {
    throw new AppError(SUBSCRIPTIONS_ERROR_MESSAGES.SUBSCRIPTIONS_NOT_FOUND, 404);
  }

  const updatedPlan = await prisma.subscriptionPlan.update({
    where: {
      id: subscription_id,
    },
    data: {
      merchant_id: merchantId,
      plan_name,
      plan_type,
      amount: new Prisma.Decimal(amount),
      duration_days,
      billing_cycle_months,
      is_active,
      updated_at: new Date(),
    }
  });

  res.status(200).json({
    success: true,
    data: {
      subscription_id: updatedPlan.id,
      merchant_id: updatedPlan.merchant_id,
      created_at: updatedPlan.created_at,
      updated_at: updatedPlan.updated_at
    },
  });
});

// ***** DELETE Subscription Plan *****//
export const deleteSubscriptionPlan = catchAsync(async (req, res) => {
  const { subscriptionId } = subscriptionIdSchema.parse({subscriptionId: Number(req.params.id)});

  const planExists = await prisma.subscriptionPlan.findFirst({
    where: {
      id: subscriptionId,
    },
  });

  if (!planExists) {
    throw new AppError(SUBSCRIPTIONS_ERROR_MESSAGES.SUBSCRIPTIONS_NOT_FOUND, 404);
  }

  const merchant = await prisma.merchant.findFirst({
    where: {
      id: planExists.merchant_id,
    },
  });

  if (!merchant) {
    throw new AppError(SUBSCRIPTIONS_ERROR_MESSAGES.FAILED_TO_DELETE_SUBSCRIPTION, 404);
  }

  const result = await prisma.subscriptionPlan.delete({
    where: {
      id: subscriptionId,
    },
  });

  if(Object.keys(result).length === 0) {
    throw new AppError(SUBSCRIPTIONS_ERROR_MESSAGES.FAILED_TO_DELETE_SUBSCRIPTION, 500);
  }

  // TODO: Send Deleted Merchant Id, Subscription Id and Correspondence Data to App Srver through the callbackurl
  syncWithServer({
    merchantId: merchant.id, 
    SubscriptionId: result.id,
    callbackUrl: merchant.callback_url,
    action: "delete"
  });

  res.status(200).json({
    success: true,
    message: SUCCESS_MESSAGE.SUCCESS,
  });
});
