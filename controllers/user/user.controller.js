import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../../config/prismaClient.js';
import AppError from '../../utils/app.error.js';
import validateFields from '../../utils/validator.js'
import {USER_ERROR_MESSAGES, SUCCESS_MESSAGE} from '../../utils/app.constant.js'
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
      where: {email: email}
    });
  
    if (existingUser) {
      throw new AppError(USER_ERROR_MESSAGES.NAME_OR_EMAIL_ALREADY_EXISTS, 400);
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
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

    if(!user) throw new AppError(USER_ERROR_MESSAGES.USER_REGISTRATION_FAILED, 400);

    res.status(201).json({
      status : SUCCESS_MESSAGE.SUCCESS,
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
        throw new AppError( USER_ERROR_MESSAGES.WRONG_EMAIL_ID, 401);
    }

    const user = users[0];

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new AppError( USER_ERROR_MESSAGES.INVALID_PASSWORD, 401);
    }

    // Generate JWT valid for 7 days
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Update updated_at into DB
    await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        updated_at: new Date(),
      },
    });

    res.status(200).json({
      status: SUCCESS_MESSAGE.SUCCESS,
      message: USER_ERROR_MESSAGES.LOGIN_SUCCESSFUL,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });
});

// ***** REFRESH TOKEN USER CONTROLLER ***** //
export const refreshTokenController = catchAsync(async (req, res) => {
  const { userid, email } = req.body;

    // Handle userid validation
    validateFields(userid, 'userid', 'number');

    // Handle email validation
    validateFields(email, 'email', 'string');

    // Get user Data
    const user = await prisma.user.findUnique({
      where: {
        id: userid,
      },
      select:{
        email: true,
        id: true
      }
    });

    if(!user) throw new AppError( USER_ERROR_MESSAGES.USER_NOT_FOUND, 400 );

    if(user.email !== email) throw new AppError( USER_ERROR_MESSAGES.WRONG_EMAIL_ID, 400 );

    const token = jwt.sign(
      { userId: userid, name: email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.status(200).json({ status: SUCCESS_MESSAGE.SUCCESS, status: SUCCESS_MESSAGE.TOKEN_REFRESHED, token });

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
        throw new AppError( USER_ERROR_MESSAGES.INVALID_EMAIL, 401);
    }

    // Get user datas
    const user = result[0];

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Update password in DB
    const updateData =  await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        password: hashedPassword,
      },
    });
    
    if(Object.keys(updateData).length === 0){
      throw new AppError( USER_ERROR_MESSAGES.PASSWORD_RESET_FAILED, 401);
    }

    res.status(200).json({
      status: SUCCESS_MESSAGE.SUCCESS,
      message: SUCCESS_MESSAGE.PASSWORD_RESET_SUCCESSFUL,
    });
});