export const Environment = Object.freeze({
  SANDBOX: 'SANDBOX',
  PRODUCTION: 'PRODUCTION'
});

export const USER_ERROR_MESSAGES = Object.freeze({
  NAME_OR_EMAIL_ALREADY_EXISTS: 'Email already exists',
  USER_REGISTERED_SUCCESSFULLY: 'User registered successfully',
  USER_REGISTRATION_FAILED: 'Failed to register user',
  INVALID_PASSWORD: 'Invalid password',
  LOGIN_SUCCESSFUL: 'Login successful',
  USER_NOT_FOUND: 'User not found',
  WRONG_EMAIL_ID: 'Wrong email ID',
  TOKEN_SAVE_FAILED: 'Failed to save token',
  INVALID_EMAIL: 'Invalid email',
  PASSWORD_RESET_FAILED: 'Failed to reset password'
});

export const AUTH_ERROR_MESSAGES = Object.freeze({
  TOKEN_MISSING: 'Access denied. Token missing',
  TOKEN_EXPIRED: 'Token expired',
  REFRESH_TOKEN_EXPIRED: 'Refresh Token expired',
  INVALID_TOKEN: 'Invalid token',
});

export const SUCCESS_MESSAGE = Object.freeze({
  SUCCESS : "success",
  TOKEN_REFRESHED: 'Token refreshed',
  PASSWORD_RESET_SUCCESSFUL: 'Password reset successful'
})
