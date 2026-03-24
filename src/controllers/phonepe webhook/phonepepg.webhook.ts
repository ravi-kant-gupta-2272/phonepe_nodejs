import { Request, Response } from "express";
import { verifyWebhookAuth } from "../../utils/verifyWebhook.js";
import {
  handleSubscriptionSetup,
  handleSubscriptionStateChange,
  handleRedemptionEvent,
  handleNotificationEvent,
} from "../../services/subscription.service.js";
import catchAsync from "../../utils/catchAsync.js"


export const phonepeWebhook = catchAsync( async(req,res)=>{

    const authHeader = req.headers["authorization"] as string;

    // Verify Authorization
    if (!authHeader || !verifyWebhookAuth(authHeader)) {
      return res.status(401).json({ message: "Unauthorized webhook" });
    }

    console.log("Webhook verified:--- ", req.body);
    
    ///TODO: CHECK EVENT AND SAVE INTO DB

    res.status(200).send({
        status: "OK"
    })
})

export const phonepeWebhookHandler = async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers["authorization"] as string;

    // Verify Authorization
    if (!authHeader || !verifyWebhookAuth(authHeader)) {
      return res.status(401).json({ message: "Unauthorized webhook" });
    }

    const { event, payload } = req.body;

    if (!event || !payload) {
      return res.status(400).json({ message: "Invalid webhook body" });
    }   

    console.log(" PhonePe Webhook:", event);
    console.log(" WEBHOOK PAYLOAD- ", payload);
    if(!(payload.paymentDetails[0].splitInstruments)) console.log("WEBHOOK splitInstruments DATA-", payload.paymentDetails[0].splitInstruments);

    // Step 2: Route based on event
    switch (event) {
      /**
       * =========================
       * 1. SUBSCRIPTION SETUP
       * =========================
       */
      case "checkout.order.completed":
      case "subscription.setup.order.completed":
        await handleSubscriptionSetup(payload, true);
        break;

      case "checkout.order.failed":
      case "subscription.setup.order.failed":
        await handleSubscriptionSetup(payload, false);
        break;

      /**
       * =========================
       * 2. SUBSCRIPTION STATE
       * =========================
       */
      case "subscription.cancelled":
      case "subscription.revoked":
      case "subscription.paused":
      case "subscription.unpaused":
        await handleSubscriptionStateChange(event, payload);
        break;

      /**
       * =========================
       * 3. NOTIFICATION (PRE-DEBIT)
       * =========================
       */
      case "subscription.notification.completed":
      case "subscription.notification.failed":
        await handleNotificationEvent(event, payload);
        break;

      /**
       * =========================
       * 4. REDEMPTION (AUTO DEBIT)
       * =========================
       */
      case "subscription.redemption.order.completed":
      case "subscription.redemption.order.failed":
      case "subscription.redemption.transaction.completed":
      case "subscription.redemption.transaction.failed":
        await handleRedemptionEvent(event, payload);
        break;

      default:
        console.log(" Unhandled event:", event);
    }

    // Always respond 200
    return res.status(200).json({ success: true });
  } catch (error) {
    console.error(" Webhook Error:", error);
    return res.status(500).json({ message: "Webhook processing failed" });
  }
};
