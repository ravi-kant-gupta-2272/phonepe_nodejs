import { PhonePeWebhookPayload } from "../types/phonepeWebhook.js"

/**
 * 1. SUBSCRIPTION SETUP
 */
export const handleSubscriptionSetup = async (
  payload: PhonePeWebhookPayload,
  isSuccess: boolean
) => {
  const {
    merchantSubscriptionId,
    subscriptionId,
  } = payload.paymentFlow || {};

  if (!merchantSubscriptionId) return;

  if (isSuccess) {
    // ✅ Activate subscription
    console.log(" Subscription Activated:", merchantSubscriptionId);
    console.log(" Subscription Id:", subscriptionId);

    /// TODO: Save Into DB

    // await db.subscription.update({
    //   where: { merchantSubscriptionId },
    //   data: {
    //     status: "ACTIVE",
    //     phonepeSubscriptionId: subscriptionId,
    //   },
    // });
  } else {
    console.log(" Subscription Setup Failed:", merchantSubscriptionId);

    /// TODO: Save Into DB

    // await db.subscription.update({
    //   where: { merchantSubscriptionId },
    //   data: { status: "FAILED" },
    // });
  }
};

/**
 * 2. STATE CHANGE
 */
export const handleSubscriptionStateChange = async (
  event: string,
  payload: PhonePeWebhookPayload,

) => {
  const { state } = payload;
  const { merchantSubscriptionId } = payload.paymentFlow as { merchantSubscriptionId: string };
  if (!merchantSubscriptionId) return;
  console.log(" State Change:", event, state);
  console.log("merchantSubscriptionId:", merchantSubscriptionId);

  /// TODO: Save Into DB

  //   await db.subscription.update({
  //     where: { merchantSubscriptionId },
  //     data: { status: state },
  //   });
};

/**
 * 3. NOTIFICATION (before debit)
 */
export const handleNotificationEvent = async (
  event: string,
  payload: PhonePeWebhookPayload
) => {
  const { merchantSubscriptionId } = payload.paymentFlow || {};

  console.log(" Notification:", event);
  console.log("merchantSubscriptionId:", merchantSubscriptionId);
  
  /// TODO: Save Into DB

  //   await db.notifications.create({
  //     data: {
  //       subscriptionId: merchantSubscriptionId,
  //       type: "PAYMENT_REMINDER",
  //     },
  //   });
};

/**
 * 4. REDEMPTION (AUTO-DEBIT RESULT)
 */
export const handleRedemptionEvent = async (
  event: string,
  payload: PhonePeWebhookPayload
) => {
  const { merchantSubscriptionId } = payload.paymentFlow || {};
  const payment = payload.paymentDetails?.[0];

  console.log("💳 Redemption Event:", event);
  console.log("payment Ditails:", payment);

  if (!merchantSubscriptionId) return;

  if (event.includes("completed")) {
    
    /// TODO: Save Into DB

    // await db.payment.create({
    //   data: {
    //     subscriptionId: merchantSubscriptionId,
    //     amount: payload.amount,
    //     status: "SUCCESS",
    //     transactionId: payment?.transactionId,
    //   },
    // });

    console.log("✅ Auto Debit Success");
  } else {
    
    /// TODO: Save Into DB

    // await db.payment.create({
    //   data: {
    //     subscriptionId: merchantSubscriptionId,
    //     amount: payload.amount,
    //     status: "FAILED",
    //     transactionId: payment?.transactionId,
    //   },
    // });

    console.log(" Auto Debit Failed");
  }
};