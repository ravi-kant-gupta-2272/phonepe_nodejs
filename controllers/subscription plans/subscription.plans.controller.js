import prisma from '../../config/prismaClient.js'
import catchAsync from '../../utils/catchAsync.js';
import AppError from '../../utils/app.error.js';
// import Environment from '../../constants/merchant.environment.js'

// ***** CREATE Subscription Plan *****//
export const createSubscriptionPlan = catchAsync(async (req, res) => {
  const {
      merchant_id,
      plan_name,
      plan_type,
      amount,
      duration_days,
      billing_cycle_months,
      is_active = true,
    } = req.body;

    if (!merchant_id || !plan_name || !plan_type || !amount || !duration_days) {
      return next(new AppError('Missing required fields', 400));
    }

    // Ensure merchant exists
    const merchant = await prisma.merchant.findUnique({
      where: { id: Number(merchant_id) },
    });

    if (!merchant) {
      return next(new AppError('Merchant not found', 404));
    }

    const plan = await prisma.subscriptionPlan.create({
      data: {
        merchant_id: Number(merchant_id),
        plan_name,
        plan_type,
        amount,
        duration_days,
        billing_cycle_months,
        is_active,
      },
    });

    res.status(201).json({
      success: true,
      data: plan,
    });
});

// ***** GET ALL Subscription Plans *****//
export const getAllSubscriptionPlans = catchAsync(async (req, res) => {
  const plans = await prisma.subscriptionPlan.findMany({
      include: {
        merchant: {
          select: {
            id: true,
            name: true,
            merchant_id: true,
          },
        },
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

// ***** GET Subscription Plans BY Merchant *****//
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

// ***** GET Subscription Plan BY ID *****//
export const getSubscriptionPlanById = catchAsync(async (req, res, next) => {
  const { id } = req.params;

    const plan = await prisma.subscriptionPlan.findUnique({
      where: {
        id: BigInt(id),
      },
      include: {
        merchant: true,
      },
    });

    if (!plan) {
      return next(new AppError('Subscription plan not found', 404));
    }

    res.status(200).json({
      success: true,
      data: plan,
    });
});

// ***** UPDATE Subscription Plan *****//
export const updateSubscriptionPlan = catchAsync(async (req, res, next) => {
  const { id } = req.params;

    const planExists = await prisma.subscriptionPlan.findUnique({
      where: {
        id: BigInt(id),
      },
    });

    if (!planExists) {
      return next(new AppError('Subscription plan not found', 404));
    }

    const updatedPlan = await prisma.subscriptionPlan.update({
      where: {
        id: BigInt(id),
      },
      data: req.body, // partial update
    });

    res.status(200).json({
      success: true,
      data: updatedPlan,
    });
});

// ***** DELETE Subscription Plan *****//
export const deleteSubscriptionPlan = catchAsync(async (req, res, next) => {
  const { id } = req.params;

    await prisma.subscriptionPlan.delete({
      where: {
        id: BigInt(id),
      },
    });

    res.status(200).json({
      success: true,
      message: 'Subscription plan deleted successfully',
    });
});
