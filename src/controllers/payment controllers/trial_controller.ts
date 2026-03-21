import phonePeWrapper from "../../services/phonepe.service.js"
import catchAsync from "../../utils/catchAsync.js";
import { paymentSchema, orderStatusSchema, debitSubscriptionSchema, subscriptionStatusSchema, SubscriptionCancelSchema } from "../../utils/zod_validator/payment_validator.js"

/// Trial Plan Payment Controller
export const paymentController = catchAsync(async (req, res) => {
    const validatedData = paymentSchema.parse(req.body);

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
        subscription_expire_at,
    } = validatedData;

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

    /// TODO: Save into DB.

    res.send({
        success: true,
        data: result
    });

})

/// Check Payment Status
export const paymentRedirectController = catchAsync(async (req, res) => {

    const { merchantOrderId } = req.query as { merchantOrderId: string };

    const status = await phonePeWrapper.checkOrderStatus({
        clientId: process.env.PHONEPE_CLIENT_ID!,
        clientVersion: Number(process.env.PHONEPE_CLIENT_VERSION),
        clientSecret: process.env.PHONEPE_CLIENT_SECRET!,
        merchantOrderId
    });

    if (status.state === "COMPLETED") {
        /// TODO: check subscription type from DB and insert.

        return res.send("Payment Success");
    }
    /// TODO: Save into DB.

    return res.send("Payment Failed");
});

export const checkOrderStatusController = catchAsync(async (req, res) => {

    const validateData = orderStatusSchema.parse(req.body);

    const {
        merchantOrderId,
        clientId,
        clientVersion,
        clientSecret
    } = validateData;

    const result = await phonePeWrapper.checkOrderStatus({
        clientId: clientId,
        clientVersion: clientVersion,
        clientSecret: clientSecret,
        merchantOrderId: merchantOrderId
    });

    /// TODO: Save into DB.

    res.send({
        success: true,
        data: result
    });
})

// Auto Debit after mandate by user.
export const notifyRedemptionController = catchAsync(async (req, res) => {
    const validatedData = debitSubscriptionSchema.parse(req.body);

    const {
        clientId,
        clientVersion,
        clientSecret,
        merchantSubscriptionId,
        amount,
        message,
    } = validatedData;

    const result = await phonePeWrapper.notifyRedemption({
        clientId,
        clientVersion,
        clientSecret,
        merchantSubscriptionId,
        amount,
        message
    });
    /// TODO: Save into DB.

    res.send({
        success: true,
        data: result
    });
})

/*
Use to check Status of Subscription after redmption.
                |
                |
                |
                V
*/
export const checkSubscriptionStatusController = catchAsync(async (req, res) => {
    const validateData = subscriptionStatusSchema.parse(req.body);

    const {
        clientId,
        clientVersion,
        clientSecret,
        subscriptionId
    } = validateData;

    const result = await phonePeWrapper.subscriptionStatus({
        clientId,
        clientVersion,
        clientSecret,
        subscriptionId
    });

    /// TODO: Save into DB.

    res.send({
        success: true,
        data: result
    });
})

export const subscriptionCancelController = catchAsync(async (req, res) => {

    const validateData = SubscriptionCancelSchema.parse(req.body);

    const {
        clientId,
        clientVersion,
        clientSecret,
        merchantSubscriptionId
    } = validateData;

    const result = phonePeWrapper.subscriptionCancel({
        clientId,
        clientVersion,
        clientSecret,
        merchantSubscriptionId
    });
    /// TODO: Save into DB.

    res.send({
        success: true,
        data: result
    });

})
