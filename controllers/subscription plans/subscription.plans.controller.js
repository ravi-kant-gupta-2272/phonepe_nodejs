import { Prisma } from "../../generated/prisma/client.ts";
import prisma from '../../config/prismaClient.js'
import catchAsync from '../../utils/catchAsync.js';
import AppError from '../../utils/app.error.js';
import validateFields from '../../utils/validator.js';
import { MERCHANT_ERROR_MESSAGES, SUCCESS_MESSAGE, SUBSCRIPTIONS_ERROR_MESSAGES } from '../../utils/app.constant.js';

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
    } = req.body;

    // Handle merchant_id validation
    validateFields(merchant_id, 'merchant_id', 'number');

    // Handle plan_name validation
    validateFields(plan_name, 'plan_name', 'string');

    // Handle plan_type validation
    validateFields(plan_type, 'plan_type', 'string');

    // Handle amount validation
    validateFields(amount, 'amount', 'number');

    // Handle duration_days validation
    validateFields(duration_days, 'duration_days', 'number');

    // Handle billing_cycle_months validation
    validateFields(billing_cycle_months, 'billing_cycle_months', 'number');

    const merchantId = Number(merchant_id);

    // Ensure merchant exists
    const merchant = await prisma.merchant.findFirst({
      where: { id: merchantId },
    });

    if (!merchant) {
      throw new AppError(MERCHANT_ERROR_MESSAGES.MERCHANT_NOT_FOUND, 404);
    }

    const plan = await prisma.subscriptionPlan.create({
      data: {
        merchant_id: merchantId,
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

    res.status(201).json({
      success: true,
      data: {...plan,amount: parseFloat(plan.amount)},
    });
});

// ***** GET Subscription Plans BY Merchant Id *****//
export const getPlansByMerchant = catchAsync(async (req, res) => {
  const { merchantId } = req.params;

    const plans = await prisma.subscriptionPlan.findMany({
      where: {
        merchant_id: Number(merchantId),
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
    } = req.body;
  
  // Handle merchant_id validation
  validateFields(merchant_id, 'merchant_id', 'number');

  // Handle plan_name validation
  validateFields(plan_name, 'plan_name', 'string');

  // Handle plan_type validation
  validateFields(plan_type, 'plan_type', 'string');

  // Handle amount validation
  validateFields(amount, 'amount', 'number');

  // Handle duration_days validation
  validateFields(duration_days, 'duration_days', 'number');

  // Handle billing_cycle_months validation
  validateFields(billing_cycle_months, 'billing_cycle_months', 'number');

  const merchantId = Number(merchant_id);

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
export const deleteSubscriptionPlan = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const  subscriptionId = Number(id);
  //Validate id
  validateFields(subscriptionId, "id", 'number');

  const planExists = await prisma.subscriptionPlan.findFirst({
    where: {
      id: subscriptionId,
    },
  });

  if (!planExists) {
    throw new AppError(SUBSCRIPTIONS_ERROR_MESSAGES.SUBSCRIPTIONS_NOT_FOUND, 404);
  }

  const result = await prisma.subscriptionPlan.delete({
    where: {
      id: subscriptionId,
    },
  });

  if(Object.keys(result).length === 0) {
    throw new AppError(SUBSCRIPTIONS_ERROR_MESSAGES.FAILED_TO_DELETE_SUBSCRIPTION, 404);
  }

  res.status(200).json({
    success: true,
    message: SUCCESS_MESSAGE.SUCCESS,
  });
});

// ***** GET ALL Subscription Plans *****//
// export const getAllSubscriptionPlans = catchAsync(async (req, res) => {
  
//   const plans = await prisma.subscriptionPlan.findMany({
//       orderBy: {
//         created_at: 'desc',
//       },
//     });

//     res.status(200).json({
//       success: true,
//       count: plans.length,
//       data: plans,
//     });
// });



// ***** GET Subscription Plan BY ID *****//
// export const getSubscriptionPlanById = catchAsync(async (req, res) => {
//   const { id } = req.params;

//     const plan = await prisma.subscriptionPlan.findUnique({
//       where: {
//         id: BigInt(id),
//       },
//       include: {
//         merchant: true,
//       },
//     });

//     if (!plan) {
//       throw new AppError('Subscription plan not found', 404);
//     }

//     res.status(200).json({
//       success: true,
//       data: plan,
//     });
// });

