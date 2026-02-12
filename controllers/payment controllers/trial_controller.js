import prisma from "../../config/prismaClient.js";
import AppError from "../../utils/app.error.js";
import phonePeWrapper from "../../services/phonepe.service.js"
import validateFields from "../../utils/validator.js";
import catchAsync from "../../utils/catchAsync.js"

export const trialPaymentController = catchAsync(async (req,res)=>{

    const {
        clientId,
        clientVersion,
        clientSecret,
        trail_amount, 
        message, 
        maxamount, 
        frequency, 
        redirect_url,
        cancel_redirect_url,
        subscription_start_at,
        subscription_expire_at
    } = req.body;

    validateFields(trail_amount, "trail_amount", "number");
    validateFields(message, "message", "string");
    validateFields(maxamount, "maxamount", "number");
    validateFields(frequency, "frequency", "string");
    validateFields(redirect_url, "redirect_url", "string");
    validateFields(cancel_redirect_url, "cancel_redirect_url", "string");
    validateFields(subscription_start_at, "subscription_start_at", "number");
    validateFields(subscription_expire_at, "subscription_expire_at", "number");

    const result = await phonePeWrapper.createAutopayOrder({
        clientId, 
        clientVersion, 
        clientSecret,
        trailAmount: trail_amount,
        message,
        maxamount,
        frequency,
        redirectUrl: redirect_url,
        cancelRedirectUrl: cancel_redirect_url,
        subscriptionStartAt: subscription_start_at,
        subscriptionExpireAt: subscription_expire_at
    });
    
    res.send({
        success: true, 
        data: result
    });
    
})

export const checkOrderStatusController = catchAsync(async(req, res)=>{
    
    const { 
        merchantOrderId, 
        clientId,
        clientVersion,
        clientSecret
    } = req.body;

    // console.log("=-=-=-=-=-=-=1---1---1")
    
    const result = await phonePeWrapper.checkOrderStatus({
        clientId: clientId, 
        clientVersion: clientVersion, 
        clientSecret: clientSecret,
        merchantOrderId: merchantOrderId
    });

    res.send({
        success: true, 
        data: result
    });
})

export const checkSubscriptionStatusController = catchAsync(async(req, res)=>{
    
    const {
        clientId,
        clientVersion,
        clientSecret,
        subscriptionId
    } = req.body;

    // console.log("=-=-=-=-=-=-=1---1---1")
    
    const result = phonePeWrapper.subscriptionStatus({
        clientId, 
        clientVersion, 
        clientSecret,
        subscriptionId
    });

    res.send({
        success: true, 
        data: result
    });
})

export const notifyRedemptionController = catchAsync(async(req, res)=>{
    
    const {
        clientId,
        clientVersion,
        clientSecret,
        merchantSubscriptionId,
        amount,
        message
    } = req.body;

    // console.log("=-=-=-=-=-=-=1---1---1");
    
    const result = phonePeWrapper.notifyRedemption({
        clientId, 
        clientVersion, 
        clientSecret,
        merchantSubscriptionId,
        amount,
        message
    });

    res.send({
        success: true, 
        data: result
    });
})

export const subscriptionCancelController = catchAsync(async(req, res)=>{
    
    const {
        clientId,
        clientVersion,
        clientSecret,
        merchantSubscriptionId
    } = req.body;

    // console.log("=-=-=-=-=-=-=1---1---1");
    
    const result = phonePeWrapper.subscriptionCancel({
        clientId, 
        clientVersion, 
        clientSecret,
        merchantSubscriptionId
    });

    res.send({
        success: true, 
        data: result
    });
    
})
