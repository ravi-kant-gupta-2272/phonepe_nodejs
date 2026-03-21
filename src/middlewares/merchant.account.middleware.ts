import catchAsync from "../utils/catchAsync.js"
import prisma from "../config/prismaClient.js"
import AppError from "../utils/app.error.js";
import { merchantSchema } from "../utils/zod_validator/payment_validator.js";

export const merchantAccountMiddleware= catchAsync(async(req, res, next)=>{

    const validateData = merchantSchema.parse(req.body);
    const { merchantId } = validateData;

    const merchant = await prisma.merchant.findFirst({
        where: {
            id: merchantId
        }
    });

    if(!merchant) throw new AppError("Failed to get Merchant Account", 404);
    
    req.body = {
        ...req.body,
        clientId: merchant.client_id,
        clientVersion: merchant.client_version,
        clientSecret: merchant.client_secret
    };
    next();
})