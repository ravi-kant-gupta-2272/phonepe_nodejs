import { z } from 'zod';


export const createPlanSchema = z.object({
  // subscription_id: z
  //   .number()
  //   .int("Subscription ID must be an integer")
  //   .positive("Subscription ID must be greater than 0"),
  merchant_id: z
    .number()
    .int("Merchant ID must be an integer")
    .positive("Merchant ID must be greater than 0"),
  plan_name: z
    .string()
    .min(2, "Plan name must be at least 2 characters")
    .max(100, "Plan name must not exceed 100 characters")
    .nonempty("Plan name is required"),
  plan_type: z.enum(["TRIAL", "MONTHLY", "YEARLY"] as const, {
    message: "Plan type must be TRIAL, MONTHLY, or YEARLY",
  }),
  amount: z
    .number()
    .nonnegative("Amount cannot be negative"),
  duration_days: z
    .number()
    .int("Duration must be an integer")
    .nonnegative("Duration cannot be negative"),
  billing_cycle_months: z
    .number()
    .int("Billing cycle must be an integer")
    .nonnegative("Billing cycle cannot be negative"),
  is_active: z.boolean().default(false),
});

export const updatePlanSchema = z.object({
  subscription_id: z
    .number()
    .int("Subscription ID must be an integer")
    .positive("Subscription ID must be greater than 0"),
  merchant_id: z
    .number()
    .int("Merchant ID must be an integer")
    .positive("Merchant ID must be greater than 0"),
  plan_name: z
    .string()
    .min(2, "Plan name must be at least 2 characters")
    .max(100, "Plan name must not exceed 100 characters")
    .nonempty("Plan name is required"),
  plan_type: z.enum(["TRIAL", "MONTHLY", "YEARLY"] as const, {
    message: "Plan type must be TRIAL, MONTHLY, or YEARLY",
  }),
  amount: z
    .number()
    .nonnegative("Amount cannot be negative"),
  duration_days: z
    .number()
    .int("Duration must be an integer")
    .nonnegative("Duration cannot be negative"),
  billing_cycle_months: z
    .number()
    .int("Billing cycle must be an integer")
    .nonnegative("Billing cycle cannot be negative"),
  is_active: z.boolean().default(false),
});

export const merchantIdSchema = z.object({
  merchantId: z
    .number()
    .int({ message: "User ID must be an integer" })
    .nonnegative({ message: "User ID must be a non-negative number" }),
});

export const subscriptionIdSchema = z.object({
  subscriptionId: z
    .number()
    .int({ message: "User ID must be an integer" })
    .nonnegative({ message: "User ID must be a non-negative number" }),
});


