import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../../config/prismaClient.js';
import AppError from '../../utils/app.error.js';
import validateFields from '../../utils/validator.js'
import {USER_ERROR_MESSAGES} from '../../utils/app.constant.js'

// ***** REGISTER USER CONTROLLER ***** //
export const registerUser = async (req, res, next) => {
  const { name, password, email } = req.body;

  try {
    // Handle name validation
    validateFields(name, 'name', 'string');

    // Handle email validation
    validateFields(email, 'email', 'string');

    // Handle password validation
    validateFields(password, 'password', 'string');

    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { name },
          { email }
        ]
      }
    });
  
    if (existingUser) {
      throw { message: USER_ERROR_MESSAGES.NAME_OR_EMAIL_ALREADY_EXISTS, statusCode: 400 };
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

    if(!user) throw { message: USER_ERROR_MESSAGES.USER_REGISTRATION_FAILED, statusCode: 400 };

    res.status(201).json({
      message: USER_ERROR_MESSAGES.USER_REGISTERED_SUCCESSFULLY,
    });

  } catch (error) {
    const errorRes = new AppError(error.message, error.statusCode || 500);
    next(errorRes);
  }
};

// ***** LOGIN USER CONTROLLER ***** //
export const loginUser = async (req, res, next) => {
  const { email, password } = req.body;

  try {

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
        throw {message: USER_ERROR_MESSAGES.WRONG_EMAIL_ID, statusCode: 401};
    }

    const user = users[0];

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw {message: USER_ERROR_MESSAGES.INVALID_PASSWORD, statusCode: 401};
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
      message: USER_ERROR_MESSAGES.LOGIN_SUCCESSFUL,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });

  } catch (error) {
    const errorRes = new AppError(error.message, error.statusCode || 500);
    next(errorRes);
  }
};

// ***** REFRESH TOKEN USER CONTROLLER ***** //
export const refreshTokenController = async (req, res, next) => {
  try {
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

    if(!user) throw { message: USER_ERROR_MESSAGES.USER_NOT_FOUND, statusCode: 400 };

    if(user.email !== email) throw { message: USER_ERROR_MESSAGES.WRONG_EMAIL_ID, statusCode: 400 };

    const token = jwt.sign(
      { userId: userid, name: email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.status(200).json({ status: USER_ERROR_MESSAGES.TOKEN_REFRESHED, token });

  } catch (err) {
    const error = new AppError(err.message, err.statusCode || 500);
    next(error);
  }
};

// ***** RESET USER PASWORD USER CONTROLLER ***** //
export const resetUserPassword = async (req, res, next) => {
  try {

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
        throw {message: USER_ERROR_MESSAGES.INVALID_EMAIL, statusCode: 401};
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
      throw {message: USER_ERROR_MESSAGES.PASSWORD_RESET_FAILED, statusCode: 401};
    }

    res.status(200).json({
      message: USER_ERROR_MESSAGES.PASSWORD_RESET_SUCCESSFUL,
    });
  } catch (error) {
    const errorRes = new AppError(error.message, error.statusCode || 500);
    next(errorRes);
  } 
};