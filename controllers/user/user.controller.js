import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import config from '../../config/config.js';
import transporter from '../../config/smtp.js';
import prisma from '../../config/prismaClient.js';
import AppError from '../../utils/app.error.js';
import validateFields from '../../utils/validator.js'
import { USER_ERROR_MESSAGES,SUCCESS_MESSAGE, AUTH_ERROR_MESSAGES } from '../../utils/app.constant.js'
import catchAsync from '../../utils/catchAsync.js';

// ***** REGISTER USER LINK CONTROLLER ***** //
export const registerLinkController = catchAsync(async (req, res) => {
  const { email } = req.body;

  // Handle email validation
  validateFields(email, 'email', 'string');

  const resetToken = jwt.sign(
    {email: email},
    config.jwt,
    {expiresIn: "5m"}
  );

  // run async in background
  (async () => {
    try {
      const to = email;
      const subject = 'Registration Link Email';
      const html = `
        <h4>Hello User</h4>
        <p>Click the link below to complete your registration.</p>
        <a href="http://localhost:5173/register?token=${resetToken}">
          http://localhost:5173/register?token=${resetToken}
        </a>
      `;

      await transporter.sendMail({
        from: `"Support" <${config.smtp.user}>`,
        to,
        subject,
        html,
      });
      console.log('Email sent successfully');
    } catch (error) {
      console.error('SMTP Error:', error.message);
    }
  })();

  res.status(200).json({
    status: SUCCESS_MESSAGE.SUCCESS,
    message: SUCCESS_MESSAGE.REGISTER_LINK_SENT_SUCCESSFULLY
  });
});

// ***** REGISTER USER CONTROLLER ***** //
export const registerUserController = catchAsync(async (req, res) => {
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
    status : SUCCESS_MESSAGE.SUCCESS,
    message: USER_ERROR_MESSAGES.USER_REGISTERED_SUCCESSFULLY,
  });
});

// ***** LOGIN USER CONTROLLER ***** //
export const loginUserController = catchAsync(async (req, res) => {
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
      updated_at: new Date(),
      is_login: true,
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
  // const { refresh_token } = req.body;
  const refresh_token = req.headers['authorization']?.split(' ')[1] || req.body.refresh_token;

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

// ***** RESET USER PASWORD CONTROLLER ***** //
export const resetUserPasswordController = catchAsync(async (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1] || req.body.token;

  const { password } = req.body;

  // Handle token validation
  validateFields(token, 'token', 'string');

  // Handle password validation
  validateFields(password, 'password', 'string');

  // Verify JWT signature
  const decoded = jwt.verify(token, config.jwt);

  // Manual expiry check (extra safety)
  const currentTime = Math.floor(Date.now() / 1000);
  if (decoded.exp < currentTime) {
      return next(
          new AppError(AUTH_ERROR_MESSAGES.TOKEN_EXPIRED, 401)
      );
  }

  const result = await prisma.user.findMany({
    where: {
      email: decoded.email,
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
      password: hashedPassword
    },
  });

  if (Object.keys(updateData).length === 0) {
    throw new AppError(USER_ERROR_MESSAGES.PASSWORD_RESET_FAILED, 401);
  }

  res.status(200).json({
    status: SUCCESS_MESSAGE.SUCCESS,
    message: USER_ERROR_MESSAGES.PASSWORD_RESET_SUCCESSFUL
  });
});

// ***** RESET PASWORD LINK USER CONTROLLER ***** //
export const resetPasswordLinkController = catchAsync(async (req, res) => {
  const { email } = req.body;

  // Handle email validation
  validateFields(email, 'email', 'string');

  const resetToken = jwt.sign(
    {email: email},
    config.jwt,
    {expiresIn: "5m"}
  );

  // run async in background
  (async () => {
    try {
      const to = email;
      const subject = 'Reset Password Email';
      const html = `
        <h4>Hello User</h4>
        <p>We received a request to reset your password. Click the link below to create a new one.</p>
        <a href="http://localhost:5173/forgotpassword?token=${resetToken}">
          http://localhost:5173/forgotpassword?token=${resetToken}
        </a>
      `;

      await transporter.sendMail({
        from: `"Support" <${config.smtp.user}>`,
        to,
        subject,
        html,
      });

      console.log('Email sent successfully');
    } catch (error) {
      console.error('SMTP Error:', error.message);
    }
  })();

  res.status(200).json({
    status: SUCCESS_MESSAGE.SUCCESS,
    message: SUCCESS_MESSAGE.RESET_LINK_SENT_SUCCESSFULLY
  });
});

// ***** VALID JWT TOKEN CONTROLLER ***** //
export const tokenExpireStatusController = catchAsync(async (req, res, next) => {
  res.status(200).json({
    status: SUCCESS_MESSAGE.SUCCESS,
    message: 'Token is valid'
  });
});