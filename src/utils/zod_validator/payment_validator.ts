import { z } from "zod";

export const paymentSchema = z.object({
  clientId: z.string().nonempty("clientId is required"),

  clientVersion: z.number(),

  clientSecret: z.string().nonempty("clientSecret is required"),

  trail_amount: z.number().min(0, "trail_amount must be >= 0"),

  message: z.string().nonempty("message is required"),

  maxamount: z.number().positive("maxamount must be > 0"),

  frequency: z.enum(["DAILY", "WEEKLY", "MONTHLY", "YEARLY"]),

  redirect_url: z.string().url("Invalid redirect_url"),

  cancel_redirect_url: z.string().url("Invalid cancel_redirect_url"),

  subscription_start_at: z.number().int(),

  subscription_expire_at: z.number().int(),
}).refine(
  (data) => data.subscription_expire_at > data.subscription_start_at,
  {
    message: "subscription_expire_at must be greater than start date",
    path: ["subscription_expire_at"],
  }
);

export const orderStatusSchema = z.object({
  merchantOrderId: z.string().nonempty("merchantOrderId is required"),

  clientId: z.string().nonempty("clientId is required"),

  clientVersion: z.number(),

  clientSecret: z.string().nonempty("clientSecret is required"),
});

export const debitSubscriptionSchema = z.object({
  clientId: z.string().nonempty("clientId is required"),

  clientVersion: z.number(),

  clientSecret: z.string().nonempty("clientSecret is required"),

  merchantSubscriptionId: z
    .string()
    .nonempty("merchantSubscriptionId is required"),

  amount: z
    .number()
    .positive("amount must be greater than 0"),

  message: z.string().nonempty("message is required"),
});

export const subscriptionStatusSchema = z.object({
  clientId: z.string().nonempty("clientId is required"),
  clientVersion: z.number(),
  clientSecret: z.string().nonempty("clientSecret is required"),
  subscriptionId: z
    .string()
    .nonempty("subscriptionId is required"),
});

export const SubscriptionCancelSchema = z.object({
  clientId: z.string().nonempty("clientId is required"),
  clientVersion: z.number(),
  clientSecret: z.string().nonempty("clientSecret is required"),
  merchantSubscriptionId: z
    .string()
    .nonempty("merchantSubscriptionId is required"),
});

export const merchantSchema = z.object({
  merchantId: z.number(),
});
