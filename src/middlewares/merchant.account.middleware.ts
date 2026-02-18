import catchAsync from "../utils/catchAsync.js"
import prisma from "../config/prismaClient.js"
import validateFields from "../utils/validator.js";
import AppError from "../utils/app.error.js";

export const merchantAccountMiddleware= catchAsync(async(req, res, next)=>{
    // console.log("-=-=-=-=-=-=-=-=-=-=-")
    // console.log(req.body)
    // console.log("==================")
    const { merchantId } = req.body;

    validateFields(merchantId, "merchantId", "number");
    
    // const numberFormateId = Number(merchantId);

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
    // console.log(`=====REQ.BODY=== ${req.body.clientId}`)
    next();
})