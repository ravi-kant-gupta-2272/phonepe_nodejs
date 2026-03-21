export interface PhonePeWebhookPayload {
  merchantId?: string;
  merchantOrderId?: string;
  orderId?: string;
  state?: "COMPLETED" | "FAILED" | "PENDING" | "ACTIVE" | "CANCELLED" | "PAUSED" | "REVOKED";
  amount?: number;
  expireAt?: number;

  errorCode?: string;
  detailedErrorCode?: string;

  paymentFlow?: {
    type?: string;
    merchantSubscriptionId?: string;
    subscriptionId?: string;
    amountType?: "FIXED" | "VARIABLE";
    frequency?: string;
    maxAmount?: number;
    autoDebit?: boolean;
  };

  paymentDetails?: Array<{
    transactionId?: string;
    state?: "COMPLETED" | "FAILED" | "PENDING";
    amount?: number;
    timestamp?: number;
  }>;
}

export interface PhonePeWebhookBody {
  event: string;
  payload: PhonePeWebhookPayload;
}