import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../../config/prismaClient.js';
import AppError from '../../utils/app.error.js';

// ***** REGISTER USER CONTROLLER ***** //
export const registerUser = async (req, res, next) => {
  const { name, password, email } = req.body;

  try {
    // Handle name validation
    if (name === undefined || name === "") {
        throw {message: "Missing name!", statusCode: 401};
    }

    // Handle email validation
    if (email === undefined || email === "" ) {
        throw {message: "Missing email!", statusCode: 401};
    }

    // Handle password validation
    if (password === undefined || password === "") {
        throw {message: "Missing password!", statusCode: 401};
    }

    const existingUser = await prisma.user.findMany({
      where: {
        OR: [
          { name },
          { email }
        ]
      }
    });

    if (existingUser.length !== 0) {
      throw { message: 'name or email already exists', statusCode: 400 };
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


    res.status(201).json({
      message: 'User registered successfully',
    });
  } catch (error) {
    const errorRes = new AppError(error.message, 400);
    next(errorRes);
  }
};

// ***** LOGIN USER CONTROLLER ***** //
export const loginUser = async (req, res, next) => {
  const { email, password } = req.body;

  try {

    // Handle email validation
    if (email === undefined || email === "" ) {
        throw {message: "Missing email!", statusCode: 401};
    }

    // Handle password validation
    if (password === undefined || password === "") {
        throw {message: "Missing password!", statusCode: 401};
    }

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
        throw {message: "Invalid name or password", statusCode: 401};
    }
    const user = users[0];

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw {message: "Invalid name or password", statusCode: 401};
    }

    // Generate JWT valid for 7 days
    const token = jwt.sign(
      { userId: user.id, name: user.email },
      process.env.JWT_SECRET || 'jwt_secret_key',
      { expiresIn: '7d' }
    );

    //Save token into DB
    await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        token: token,
        updated_at: new Date(),
      },
    });


    res.status(200).json({
      message: 'Login successful',
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

    if (userid === undefined || typeof userid !== 'number') {
      throw { message: "user Id is Missing or user Id is not Integer type.", statusCode: 400 };
    }

    if (email === undefined || typeof email !== 'string') {
      throw { message: "email is Missing or Wrong data type.", statusCode: 400 };
    }

    const token = jwt.sign(
      { userId: userid, name: email },
      process.env.JWT_SECRET || 'jwt_secret_key',
      { expiresIn: '7d' }
    );

    // Insert JWT into merchants table (Postgres)
    const updateResult = await prisma.user.update({
      where: {
        id: userid,
      },
      data: {
        token: token,
      },
    });

    if (updateResult === undefined) {
      throw { message: "Failed to save token.", statusCode: 400 };
    }

    return res.status(200).json({ status: 'success', token });
  } catch (err) {
    const error = new AppError(err.message, err.statusCode || 500);
    next(error);
  }
};

// ***** RESET USER PASWORD USER CONTROLLER ***** //
export const resetUserPassword = async (req, res, next) => {
  const { email, password } = req.body;
  try {
    // Handle email Validtion
    if (email === undefined || email === "" ) {
        throw {message: "Missing email!", statusCode: 401};
    }

    // Handle password validation
    if (password === undefined || password === "") {
        throw {message: "Missing password!", statusCode: 401};
    }

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
        throw {message: "Invalid email", statusCode: 401};
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
      throw {message: "Failed to Reset Password", statusCode: 401};
    }

    res.status(200).json({
      message: 'Password Reset successful',
    });
  } catch (error) {
    const errorRes = new AppError(error.message, error.statusCode || 500);
    next(errorRes);
  } 
};


