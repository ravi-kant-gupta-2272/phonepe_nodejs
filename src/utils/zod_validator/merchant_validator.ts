import { z } from 'zod';


export const phonePeConfigSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must not exceed 100 characters"),

  callbackUrl: z
    .url("Callback URL must be a valid URL"),

  webhookUsername: z
    .string()
    .min(3, "Webhook username must be at least 3 characters")
    .max(100).optional().default(""),

  webhookPassword: z
    .string()
    .min(8, "Webhook password must be at least 8 characters")
    .max(100).optional().default(""),

  clientId: z
    .string()
    .min(5, "Client ID is required")
    .max(100),

  clientVersion: z
    .number()
    .int("Client version must be an integer")
    .positive("Client version must be greater than 0"),

  clientSecret: z
    .string()
    .min(10, "Client secret is required")
    .max(255),

  environment: z.enum(["SANDBOX", "PRODUCTION"] as const, 
    { message: "Environment must be SANDBOX or PRODUCTION" }),

  merchantId: z
    .string()
    .min(5, "Merchant ID is required")
    .max(100)
});

export const userIdSchema = z.object({
  userId: z
    .number()
    .int({ message: "User ID must be an integer" })
    .nonnegative({ message: "User ID must be a non-negative number" }),
});

export const merchantIdSchema = z.object({
  id: z
    .number()
    .int({ message: "User ID must be an integer" })
    .nonnegative({ message: "User ID must be a non-negative number" }),
});
