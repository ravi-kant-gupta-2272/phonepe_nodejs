// const pool = require('../../db/db');
// const bcrypt = require('bcryptjs');
// const AppError = require('../../utils/app.error');
// const jwt = require('jsonwebtoken');

// const addMerchantAccount = async (req, res, next) => {
//   try {

//     // Authenticate JWT
//     const authHeader = req.headers.authorization;
//     if (!authHeader || !authHeader.startsWith('Bearer ')) {
//       throw new AppError('Authorization token missing', 401);
//     }

//     const splitHeader = authHeader.split(' ');

//     if(splitHeader[1] === undefined){
//         throw new AppError('Token missing', 401);
//     }

//     const token = splitHeader[1];

//     let payload;
//     try {
//       payload = jwt.verify(token, process.env.JWT_SECRET);
//     } catch (err) {
//       throw new AppError('Invalid or expired token', 401);
//     }

//     const createdBy = payload.id || payload.userId;
//     if (!createdBy) {
//       throw new AppError('Invalid token payload', 401);
//     }

//     // Validate body
//     const {
//       name,
//       callbackUrl,
//       webhookUsername,
//       webhookPassword,
//       clientId,
//       clientVersion,
//       clientSecret,
//       environment,
//     } = req.body || {};

//     if (!name || typeof name !== 'string') {
//       throw new AppError('name is required', 400);
//     }

//     if (!callbackUrl || typeof callbackUrl !== 'string') {
//       throw new AppError('callbackUrl is required', 400);
//     }

//     try {
//       new URL(callbackUrl);
//     } catch {
//       throw new AppError('callbackUrl is not a valid URL', 400);
//     }
    
//     const requiredStrings = {
//       webhookUsername,
//       webhookPassword,
//       clientId,
//       clientVersion,
//       clientSecret,
//       environment,
//     };
    
//     for (const [key, val] of Object.entries(requiredStrings)) {
//       if (!val || typeof val !== 'string') {
//         throw new AppError(`${key} is required and must be a string`, 400);
//       }
//     }

//     const allowedEnvs = ['sandbox', 'production'];
//     const normalizedEnv = environment.toLowerCase();
    
//     if (!allowedEnvs.includes(normalizedEnv)) {
//       throw new AppError(
//         `environment must be one of: ${allowedEnvs.join(', ')}`,
//         400
//       );
//     }

//     // Hash sensitive fields
//     const saltRounds = Number(process.env.BCRYPT_SALT_ROUNDS) || 12;

//     const hashedWebhookUsername = await bcrypt.hash(webhookUsername, saltRounds);
//     const hashedWebhookPassword = await bcrypt.hash(webhookPassword, saltRounds);
//     const hashedClientSecret = await bcrypt.hash(clientSecret, saltRounds);

//     // Insert into DB
//     const insertQuery = `
//       INSERT INTO merchants (
//         name,
//         callback_url,
//         webhook_username,
//         webhook_password,
//         client_id,
//         client_version,
//         client_secret,
//         environment,
//         created_by
//       )
//       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
//       RETURNING id
//     `;
    

//     const values = [
//       name,
//       callbackUrl,
//       hashedWebhookUsername,
//       hashedWebhookPassword,
//       clientId,
//       clientVersion,
//       hashedClientSecret,
//       normalizedEnv,
//       createdBy,
//     ];

//     const result = await pool.query(insertQuery, values);
    
//     return res.status(201).json({
//       status: 'success',
//       data: {
//         id: result.rows[0].id,
//       },
//     });
//   } catch (err) {
//     next(err instanceof AppError ? err : new AppError(err.message, 500));
//   }
// };

// module.exports = addMerchantAccount;
