type EnvironmentType = Record<string, string>;
type UserErrorMessagesType = Record<string, string>;
type AuthErrorMessagesType = Record<string, string>;
type SuccessMessagesType = Record<string, string>;
type MerchantErrorMessagesType = Record<string, string>;
type SubscriptionsErrorMessagesType = Record<string, string>;

export const Environment: EnvironmentType = Object.freeze({
  SANDBOX: "SANDBOX",
  PRODUCTION: "PRODUCTION"
});

export const USER_ERROR_MESSAGES: UserErrorMessagesType = Object.freeze({
  EMAIL_ALREADY_EXISTS: 'Email already exists',
  USER_REGISTERED_SUCCESSFULLY: 'User registered successfully',
  USER_REGISTRATION_FAILED: 'Failed to register user',
  INVALID_PASSWORD: 'Invalid password',
  LOGIN_SUCCESSFUL: 'Login successful',
  USER_NOT_FOUND: 'User not found',
  WRONG_EMAIL_ID: 'Wrong email ID',
  TOKEN_SAVE_FAILED: 'Failed to save token',
  INVALID_EMAIL: 'Invalid email',
  PASSWORD_RESET_FAILED: 'Failed to reset password',
  JSON_WEB_TOKEN_ERROR: 'JsonWebTokenError',
  TOKEN_EXPIRE_ERROR: 'TokenExpiredError',
  INVALID_PRISMA_QUERY: 'Invalid Prisma query'
});

export const AUTH_ERROR_MESSAGES: AuthErrorMessagesType = Object.freeze({
  TOKEN_MISSING: 'Access denied. Token missing',
  TOKEN_EXPIRED: 'Token expired',
  REFRESH_TOKEN_EXPIRED: 'Refresh Token expired',
  INVALID_TOKEN: 'Invalid token',
  PASSWORD_RESET_FAILED: 'Failed to reset password',
  PASSWORD_RESET_SUCCESSFUL: 'Password reset successful',
  LOGIN_FAILED: 'Login failed',
  INVALID_REFRESH_TOKEN: 'Invalid refresh token'
});

export const SUCCESS_MESSAGE:SuccessMessagesType = Object.freeze({
  SUCCESS : "success",
  TOKEN_REFRESHED: 'Token refreshed',
  PASSWORD_RESET_SUCCESSFUL: 'Password reset successful',
  RESET_LINK_SENT_SUCCESSFULLY: 'Reset link sent successfully',
  REGISTER_LINK_SENT_SUCCESSFULLY: 'Register link sent successfully',
  MERCHANT_DELETED_SUCCESSFULLY: 'Merchant deleted successfully'
})

export const MERCHANT_ERROR_MESSAGES: MerchantErrorMessagesType = Object.freeze({
  INVALID_CALLBACKURL: "callbackUrl is not a valid URL",
  MERCHANT_NOT_FOUND: "Merchant is not found",
  ENVIRONMENT_INVALID: "environment must be one of: SANDBOX, PRODUCTION",
  FAILED_TO_SAVE: "Failed to Saved Data"
});

export const SUBSCRIPTIONS_ERROR_MESSAGES: SubscriptionsErrorMessagesType = Object.freeze({
  INVALID_CALLBACKURL: "callbackUrl is not a valid URL",
  ENVIRONMENT_INVALID: "environment must be one of: SANDBOX, PRODUCTION",
  SUBSCRIPTIONS_CREATION_FAILED: 'Failed to create subscription plan',
  SUBSCRIPTIONS_NOT_FOUND: 'Subscription plan not found',
  FAILED_TO_DELETE_SUBSCRIPTION: 'Failed to delete subscription plan'
});
