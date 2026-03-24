import express from 'express';
import {
    paymentController, 
    checkOrderStatusController, 
    checkSubscriptionStatusController,
    notifyRedemptionController,
    subscriptionCancelController
} from "../controllers/payment controllers/trial_controller.js"
import { phonepeWebhookHandler } from '../controllers/phonepe webhook/phonepepg.webhook.js';
import { merchantAccountMiddleware } from '../middlewares/merchant.account.middleware.js';

const paymentRouter = express.Router();

// ***** Payment router *****//
paymentRouter.post("/payment/trial", merchantAccountMiddleware, paymentController);

// ***** Check Order Status payment router *****//
paymentRouter.post("/payment/check-order-status", merchantAccountMiddleware, checkOrderStatusController);

// ***** Check Subscription Status payment router *****//
paymentRouter.post("/payment/check-order-status", merchantAccountMiddleware, checkSubscriptionStatusController);

// ***** Notify Redemption router *****//
paymentRouter.post("/payment/notify-redemption", merchantAccountMiddleware, notifyRedemptionController);

// ***** Subscription Cancel router *****//
paymentRouter.post("/payment/notify-redemption", merchantAccountMiddleware, subscriptionCancelController);

// ***** Webhook router *****//
paymentRouter.post("/payment/webhook", phonepeWebhookHandler);



export default paymentRouter;