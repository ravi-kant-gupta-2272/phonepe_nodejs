const pool = require('../../db/db');
const bcrypt = require('bcryptjs');
const AppError = require("../../utils/app.error")


// const handleValidation= async ({ name, password, email })=>{
//   // Handle name validation
//     if (name === undefined || name === "") {
//         throw {message: "Missing name!", statusCode: 401};
//     }

//     // Handle email validation
//     if (email === undefined || email === "" ) {
//         throw {message: "Missing email!", statusCode: 401};
//     }

//     // Handle password validation
//     if (password === undefined || password === "") {
//         throw {message: "Missing password!", statusCode: 401};
//     }
// }

const registerUser = async (req, res, next) => {
  const { name, password, email } = req.body;

  try {
    // await handleValidation({ name, password, email });
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

    // Check if user already exists
    const userCheckQuery = 'SELECT * FROM users WHERE name = $1 OR email = $2';
    const userCheckResult = await pool.query(userCheckQuery, [name, email]);

    if (userCheckResult.rows.length > 0) {
      throw {message: 'name or email already exists', statusCode: 400};
      // return res.status(400).json({ message: 'name or email already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Insert new user into database
    const insertUserQuery = `
      INSERT INTO users (name, password, email)
      VALUES ($1, $2, $3)
      RETURNING id
    `;

    await pool.query(insertUserQuery, [
      name,
      hashedPassword,
      email
    ]);


    res.status(201).json({
      message: 'User registered successfully',
    });
  } catch (error) {
    const errorRes = new AppError(error.message, 400);
    next(errorRes);
  }
};

module.exports = registerUser;