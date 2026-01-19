const bcrypt = require('bcryptjs');
const pool = require('../../db/db');
const AppError = require("../../utils/app.error")


const handleValidation = async ({ email, password })=>{
    // Handle email validation
    if (email === undefined || email === "" ) {
        throw {message: "Missing email!", statusCode: 401};
    }

    // Handle password validation
    if (password === undefined || password === "") {
        throw {message: "Missing password!", statusCode: 401};
    }
}


const resetUserPassword = async (req, res, next) => {
  const { email, password } = req.body;
  try {
    // Handle Validtion
    await handleValidation({ email, password });

    const query = 'SELECT id FROM users WHERE email = $1';
    const result = await pool.query(query, [email]);

    // Handle user data validation
    if (result.rows.length === 0) {
        throw {message: "Invalid email", statusCode: 401};
    }

    // Get user datas
    const user = result.rows[0];

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Update password in DB
    const updateQuery = 'UPDATE users SET password = $1 WHERE id = $2';
    await pool.query(updateQuery, [hashedPassword, user.id]);

    res.status(200).json({
      message: 'Password Reset successful',
    });
  } catch (error) {
    const errorRes = new AppError(error.message, error.statusCode || 500);
    next(errorRes);
  } 
};

module.exports = resetUserPassword;

