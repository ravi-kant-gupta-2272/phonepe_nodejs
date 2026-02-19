import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import config from '../../config/config.js';
import transporter from '../../config/smtp.js';
import prisma from '../../config/prismaClient.js';
import AppError from '../../utils/app.error.js';
import { USER_ERROR_MESSAGES,SUCCESS_MESSAGE, AUTH_ERROR_MESSAGES } from '../../utils/app.constant.js'
import catchAsync from '../../utils/catchAsync.js';
import { registerSchema, registerUserSchema, loginUserSchema, resetUserSchema, tokenSchema } from '../../utils/zod_validator/user_validator.js';
import logger from '../../utils/logger.js';

// ***** REGISTER USER LINK CONTROLLER ***** //
export const registerLinkController = catchAsync(async (req, res) => {
  const { email } = registerSchema.parse(req.body);

  const registerToken = jwt.sign(
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
        <a href="http://localhost:5173/register?token=${registerToken}">
          http://localhost:5173/register?token=${registerToken}
        </a>
      `;

      await transporter.sendMail({
        from: `"Support" <${config.smtp.user}>`,
        to,
        subject,
        html,
      });
    } catch (error) {
      const err = error as any;
      logger.error(err.message, { stack: process.env.NODE_ENV === "development" ? err.stack : undefined });
    }
  })();

  res.status(200).json({
    status: SUCCESS_MESSAGE.SUCCESS,
    message: SUCCESS_MESSAGE.REGISTER_LINK_SENT_SUCCESSFULLY
  });
});

// ***** REGISTER USER CONTROLLER ***** //
export const registerUserController = catchAsync(async (req, res) => {
  const {token} = tokenSchema.parse(req.headers['authorization']?.split(' ')[1]);

  const { name, password } = req.body;

  const isVerified = jwt.verify(token, config.jwt);

  if(typeof isVerified === "string"){
    throw new AppError(AUTH_ERROR_MESSAGES.INVALID_TOKEN, 401);
  }
  
  const decoded: jwt.JwtPayload = isVerified;

  const currentTime = Math.floor(Date.now() / 1000);

  if (decoded.exp! < currentTime) {
      throw new AppError(AUTH_ERROR_MESSAGES.TOKEN_EXPIRED, 401);
  }

  const existingUser = await prisma.user.findUnique({
    where: { email: decoded.email }
  })??{};

  // Handle user data validation
  if (Object.keys(existingUser).length === 0) {
    throw new AppError(USER_ERROR_MESSAGES.INVALID_EMAIL, 404);
  }

  if (existingUser) {
    // console.log("-=-=-=-=-=-=-=-=-=-=-=-2")
    throw new AppError(USER_ERROR_MESSAGES.EMAIL_ALREADY_EXISTS, 409);
  }
// console.log("-=-=-=-=-=-=-=-=-=-=-=-3")
  // Hash password
  const salt = await bcrypt.genSalt(config.bcrypt_salt_rounds);
  const hashedPassword = await bcrypt.hash(password, salt);

  // Create new user
  const user = await prisma.user.create({
    data: {
      name,
      email: decoded.email,
      password: hashedPassword
    },
    select: {
      id: true
    }
  });

  if (!user) throw new AppError(USER_ERROR_MESSAGES.USER_REGISTRATION_FAILED, 500);

  res.status(201).json({
    status : SUCCESS_MESSAGE.SUCCESS,
    message: USER_ERROR_MESSAGES.USER_REGISTERED_SUCCESSFULLY,
  });
});

// ***** LOGIN USER CONTROLLER ***** //
export const loginUserController = catchAsync(async (req, res) => {
  const { email, password } = loginUserSchema.parse(req.body);

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

  if (users.length === 0) {
    throw new AppError(USER_ERROR_MESSAGES.WRONG_EMAIL_ID, 401);
  }

  const user = users[0];

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new AppError(USER_ERROR_MESSAGES.INVALID_PASSWORD, 401);
  }

  const accessToken = jwt.sign(
    { userId: user.id, email: user.email },
    config.jwt,
    { expiresIn: '1d' }
  );

  const refreshTokenIdNew = uuidv4();

  const refreshToken = jwt.sign(
    {
      userId: user.id,
      name: email,
      refreshTokenId: refreshTokenIdNew
    },
    config.jwt,
    { expiresIn: '7d' }
  );

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
    throw new AppError(USER_ERROR_MESSAGES.LOGIN_FAILED, 500);
  }

  res.status(200).json({
    status: SUCCESS_MESSAGE.SUCCESS,
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

  const {token} = tokenSchema.parse({token: req.headers['authorization']?.split(' ')[1]});

  const isVerified = jwt.verify(token, config.jwt);
  if(typeof isVerified === "string"){
    throw new AppError(AUTH_ERROR_MESSAGES.INVALID_TOKEN, 401);
  }

  const decoded: jwt.JwtPayload = isVerified;

  const currentTime = Math.floor(Date.now() / 1000);
  if (decoded.exp! < currentTime) {
    return new AppError(AUTH_ERROR_MESSAGES.REFRESH_TOKEN_EXPIRED, 401);
  }

  const userid = decoded.userId; 
  const email = decoded.email;   
  const refreshTokenId = decoded.refreshTokenId;  

  const userData = await prisma.user.findFirstOrThrow({
    where: {
      id: userid,
      refresh_token_id: refreshTokenId
    },
    select: { id: true }
  }).catch(() => {
    throw new AppError(AUTH_ERROR_MESSAGES.INVALID_REFRESH_TOKEN, 401);
  });

  if (userid !== userData.id) {
    throw new AppError(AUTH_ERROR_MESSAGES.INVALID_REFRESH_TOKEN, 401);
  }

  const aceessToken = jwt.sign(
    { userId: userid, name: email },
    config.jwt,
    { expiresIn: '1d' }
  );

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

  const result = await prisma.user.update({
    where: {
      id: userid
    },
    data: {
      refresh_token_id: refreshTokenIdNew
    },
  });

  if (Object.keys(result).length === 0) {
    throw new AppError(AUTH_ERROR_MESSAGES.REFRESH_TOKEN_UPDATE_FAILED, 500);
  }

  return res.status(200).json({
    status: SUCCESS_MESSAGE.SUCCESS,
    aceessToken,
    refreshToken: newRefreshToken
  });
});

// ***** RESET USER PASWORD CONTROLLER ***** //
export const resetUserPasswordController = catchAsync(async (req, res) => {
  const {token} = tokenSchema.parse(req.headers['authorization']?.split(' ')[1]);

  const { password } = resetUserSchema.parse(req.body);

  const isVerified = jwt.verify(token, config.jwt);

  if (typeof isVerified === 'string') {
    throw new AppError(AUTH_ERROR_MESSAGES.INVALID_TOKEN, 401);
  }

  const decoded: jwt.JwtPayload = isVerified;

  const currentTime = Math.floor(Date.now() / 1000);
  if (decoded.exp! < currentTime) {
      throw new AppError(AUTH_ERROR_MESSAGES.TOKEN_EXPIRED, 401);
  }

  const result = await prisma.user.findMany({
    where: {
      email: decoded.email,
    },
    select: {
      id: true,
    },
  });

  if (result.length === 0) {
    throw new AppError(USER_ERROR_MESSAGES.INVALID_EMAIL, 404);
  }

  const user = result[0];

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const updateData = await prisma.user.update({
    where: {
      id: user.id,
    },
    data: {
      password: hashedPassword
    },
  });

  if (Object.keys(updateData).length === 0) {
    throw new AppError(USER_ERROR_MESSAGES.PASSWORD_RESET_FAILED, 500);
  }

  res.status(200).json({
    status: SUCCESS_MESSAGE.SUCCESS,
    message: USER_ERROR_MESSAGES.PASSWORD_RESET_SUCCESSFUL
  });
});

// ***** RESET PASWORD LINK USER CONTROLLER ***** //
export const resetPasswordLinkController = catchAsync(async (req, res) => {
  const { email } = registerSchema.parse(req.body);

  const user = await prisma.user.findUnique({
     where: {
      email: email,
    },
    select: {
      id: true,
    },
  }) ?? {};

  if(Object.keys(user).length === 0){
    throw new AppError(USER_ERROR_MESSAGES.WRONG_EMAIL_ID, 401);
  }

  const resetToken = jwt.sign(
    {email: email},
    config.jwt,
    {expiresIn: "5m"}
  );
console.log(resetToken);
  // run async in background
  (async () => {
    try {
      const to = email;
      const subject = 'Reset Password Email';
      const html = `
        <h4>Hello User</h4>
        <p>We received  to reset your password. Click the link below to create a new one.</p>
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

    } catch (error) {
      const err = error as any;
      logger.error(err.message, { stack: process.env.NODE_ENV === "development" ? err.stack : undefined });
    }
  })();

  res.status(200).json({
    status: SUCCESS_MESSAGE.SUCCESS,
    message: SUCCESS_MESSAGE.RESET_LINK_SENT_SUCCESSFULLY
  });
});

// ***** VALID JWT TOKEN CONTROLLER ***** //
export const tokenExpireStatusController = catchAsync(async (req, res) => {
  res.status(200).json({
    status: SUCCESS_MESSAGE.SUCCESS,
    message: 'Token is valid'
  });
});