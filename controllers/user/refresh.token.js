const jwt = require('jsonwebtoken');
const pool = require('../../db/db')
const AppError = require("../../utils/app.error")

const refeshTokenController = async(req,res,next) =>{
    
    try {
        console.log(req.body);
        const {userid, email} = req.body;

        if(userid === undefined || (typeof userid !== 'number')){
            throw {message: "user Id is Missing or user Id is not Integer type.", statusCode: 400};
        }

        if(email === undefined || typeof email !== 'string'){
            throw {message: "email is Missing or Wrong data type.", statusCode: 400};
        }

        const token = jwt.sign(
            { userId: userid, name: email },
            process.env.JWT_SECRET || 'jwt_secret_key',
            { expiresIn: '7d' }
        );

        // Upsert JWT into merchants table (Postgres)
        const updateResult = await pool.query(
            'UPDATE users SET token = $1 WHERE id = $2',
            [token, userid]
        );

        if (updateResult.rowCount === 0) {
            throw {message: "Failed to save token.", statusCode: 400};
        }

        return res.status(200).json({ status: 'success', token });


    } catch (err) {
        const error = new AppError(message= err.message, statusCode = err.statusCode);
        next(error);
    }
}


module.exports = refeshTokenController;
