export const Environment = Object.freeze({
  SANDBOX: 'SANDBOX',
  PRODUCTION: 'PRODUCTION'
});

export const USER_ERROR_MESSAGES = Object.freeze({
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
  TOKEN_EXPIRE_ERROR: 'TokenExpiredError'
});

export const AUTH_ERROR_MESSAGES = Object.freeze({
  TOKEN_MISSING: 'Access denied. Token missing',
  TOKEN_EXPIRED: 'Token expired',
  REFRESH_TOKEN_EXPIRED: 'Refresh Token expired',
  INVALID_TOKEN: 'Invalid token',
  PASSWORD_RESET_FAILED: 'Failed to reset password',
  PASSWORD_RESET_SUCCESSFUL: 'Password reset successful',
  LOGIN_FAILED: 'Login failed',
  REFRESH_TOKEN_EXPIRED: 'Refresh token has expired',
  INVALID_REFRESH_TOKEN: 'Invalid refresh token'
});

export const SUCCESS_MESSAGE = Object.freeze({
  SUCCESS : "success",
  TOKEN_REFRESHED: 'Token refreshed',
  PASSWORD_RESET_SUCCESSFUL: 'Password reset successful',
  RESET_LINK_SENT_SUCCESSFULLY: 'Reset link sent successfully',
  REGISTER_LINK_SENT_SUCCESSFULLY: 'Register link sent successfully',
  MERCHANT_DELETED_SUCCESSFULLY: 'Merchant deleted successfully'
})


export const MERCHANT_ERROR_MESSAGES = Object.freeze({
  INVALID_CALLBACKURL: "callbackUrl is not a valid URL",
  MERCHANT_NOT_FOUND: "Merchant is not found",
  ENVIRONMENT_INVALID: "environment must be one of: SANDBOX, PRODUCTION",
  MERCHANT_NOT_FOUND: "Merchant not found",
});
