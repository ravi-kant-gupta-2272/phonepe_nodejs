const pool = require('../../db/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const AppError = require("../../utils/app.error")

const loginUser = async (req, res, next) => {
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

    const query = 'SELECT id, name, email, password FROM users WHERE email = $1';
    const result = await pool.query(query, [email]);

    // Handle user data validation
    if (result.rows.length === 0) {
        throw {message: "Invalid name or password", statusCode: 401};
    }

    const user = result.rows[0];

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw {message: "Invalid name or password", statusCode: 401};
      // return res.status(401).json({ message: 'Invalid name or password' });
    }

    // Generate JWT valid for 7 days
    const token = jwt.sign(
      { userId: user.id, name: user.email },
      process.env.JWT_SECRET || 'jwt_secret_key',
      { expiresIn: '7d' }
    );

    //Save token into DB
    await pool.query(
      'UPDATE users SET token = $1, last_change_at = now() WHERE id = $2',
      [token, user.id]
    );

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

module.exports = loginUser;