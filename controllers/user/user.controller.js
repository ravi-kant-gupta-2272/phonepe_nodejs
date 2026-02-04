import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import config from '../../config/config.js';
import prisma from '../../config/prismaClient.js';
import AppError from '../../utils/app.error.js';
import validateFields from '../../utils/validator.js'
import { USER_ERROR_MESSAGES,SUCCESS_MESSAGE, AUTH_ERROR_MESSAGES } from '../../utils/app.constant.js'
import catchAsync from '../../utils/catchAsync.js';

// ***** REGISTER USER CONTROLLER ***** //
export const registerUser = catchAsync(async (req, res) => {
  const { name, password, email } = req.body;

  // Handle name validation
  validateFields(name, 'name', 'string');

  // Handle email validation
  validateFields(email, 'email', 'string');

  // Handle password validation
  validateFields(password, 'password', 'string');

  const existingUser = await prisma.user.findUnique({
    where: { email: email }
  });

  if (existingUser) {
    throw new AppError(USER_ERROR_MESSAGES.EMAIL_ALREADY_EXISTS, 400);
  }

  // Hash password
  const salt = await bcrypt.genSalt(parseInt(config.bcrypt_salt_rounds));
  const hashedPassword = await bcrypt.hash(password, salt);

  // Create new user
  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword
    },
    select: {
      id: true
    }
  });

  if (!user) throw new AppError(USER_ERROR_MESSAGES.USER_REGISTRATION_FAILED, 400);

  res.status(201).json({
    status: 'success',
    message: USER_ERROR_MESSAGES.USER_REGISTERED_SUCCESSFULLY,
  });
});

// ***** LOGIN USER CONTROLLER ***** //
export const loginUser = catchAsync(async (req, res) => {
  const { email, password } = req.body;

  // Handle email validation
  validateFields(email, 'email', 'string');

  // Handle password validation
  validateFields(password, 'password', 'string');

  const users = await prisma.user.findMany({
    where: {
      email: email,
    },
    select: {
      id: true,
      name: true,
      email: true,
      password: true,
    },
  });

  // Handle user data validation
  if (users.length === 0) {
    throw new AppError(USER_ERROR_MESSAGES.WRONG_EMAIL_ID, 401);
  }

  const user = users[0];

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new AppError(USER_ERROR_MESSAGES.INVALID_PASSWORD, 401);
  }

  // Generate JWT valid for 7 days
  const accessToken = jwt.sign(
    { userId: user.id, email: user.email },
    config.jwt,
    { expiresIn: '1d' }
  );

  // Generate refresh tokens Id
  const refreshTokenIdNew = uuidv4();

  // Generate new refresh tokens
  const refreshToken = jwt.sign(
    {
      userId: user.id,
      name: email,
      refreshTokenId: refreshTokenIdNew
    },
    config.jwt,
    { expiresIn: '7d' }
  );

  // Update updated_at into DB
  const result = await prisma.user.update({
    where: {
      id: user.id,
    },
    data: {
      refresh_token_id: refreshTokenIdNew,
      updated_at: new Date()
      
    },
  });

  if(Object.keys(result).length === 0){
    throw new AppError(USER_ERROR_MESSAGES.LOGIN_FAILED, 401);
  }

  res.status(200).json({
    message: USER_ERROR_MESSAGES.LOGIN_SUCCESSFUL,
    accessToken,
    refreshToken,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
    },
  });
});

// ***** REFRESH TOKEN USER CONTROLLER ***** //
export const refreshTokenController = catchAsync(async (req, res) => {
  const { refresh_token } = req.body;

  // Handle refesh token validation
  validateFields(refresh_token, 'Refresh Token', 'string');

  const decoded = jwt.verify(refresh_token, config.jwt);

  // Expiry check
  const currentTime = Math.floor(Date.now() / 1000);
  if (decoded.exp < currentTime) {
    return new AppError(AUTH_ERROR_MESSAGES.REFRESH_TOKEN_EXPIRED, 401);
  }

  const userid = decoded.userId;  // User id from token
  const email = decoded.email;    // User email from token
  const refreshTokenId = decoded.refreshTokenId;  // Refresh token id from token

  // Verify refresh token against DB
  const userData = await prisma.user.findFirstOrThrow({
    where: {
      id: userid,
      refresh_token_id: refreshTokenId
    },
    select: { id: true }
  }).catch(() => {
    throw new AppError(AUTH_ERROR_MESSAGES.INVALID_REFRESH_TOKEN, 401);
  });

  // Validate user id
  if (userid !== userData.id) {
    throw new AppError(AUTH_ERROR_MESSAGES.INVALID_REFRESH_TOKEN, 401);
  }

  // Generate new access tokens
  const aceessToken = jwt.sign(
    { userId: userid, name: email },
    config.jwt,
    { expiresIn: '1d' }
  );

  // Generate new refresh tokens
  const refreshTokenIdNew = uuidv4();
  const newRefreshToken = jwt.sign(
    {
      userId: userid,
      name: email,
      refreshTokenId: refreshTokenIdNew
    },
    config.jwt,
    { expiresIn: '7d' }
  );

  // Update refresh token id in DB
  const result = await prisma.user.update({
    where: {
      id: userid
    },
    data: {
      refresh_token_id: refreshTokenIdNew
    },
  });

  if (Object.keys(result).length === 0) {
    throw new AppError(AUTH_ERROR_MESSAGES.REFRESH_TOKEN_UPDATE_FAILED, 401);
  }

  return res.status(200).json({
    status: SUCCESS_MESSAGE.SUCCESS,
    status: SUCCESS_MESSAGE.TOKEN_REFRESHED,
    aceessToken,
    refreshToken: newRefreshToken
  });
});

// ***** RESET USER PASWORD USER CONTROLLER ***** //
export const resetUserPassword = catchAsync(async (req, res) => {
  const { email, password } = req.body;

  // Handle email validation
  validateFields(email, 'email', 'string');

  // Handle password validation
  validateFields(password, 'password', 'string');

  const result = await prisma.user.findMany({
    where: {
      email: email,
    },
    select: {
      id: true,
    },
  });

  // Handle user data validation
  if (result.length === 0) {
    throw new AppError(USER_ERROR_MESSAGES.INVALID_EMAIL, 401);
  }

  // Get user datas
  const user = result[0];

  // Hash password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  // Update password in DB
  const updateData = await prisma.user.update({
    where: {
      id: user.id,
    },
    data: {
      password: hashedPassword,
    },
  });

  if (Object.keys(updateData).length === 0) {
    throw new AppError(USER_ERROR_MESSAGES.PASSWORD_RESET_FAILED, 401);
  }

  res.status(200).json({
    message: USER_ERROR_MESSAGES.PASSWORD_RESET_SUCCESSFUL
  });
});