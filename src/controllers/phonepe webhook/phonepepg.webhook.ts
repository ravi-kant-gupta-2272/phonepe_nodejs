
// import AppError from "../../utils/app.error.js";
// import phonePeWrapper from "../../services/phonepe.service.js"
// import validateFields from "../../utils/validator.js";
import catchAsync from "../../utils/catchAsync.js"

export const phonepeWebhook = catchAsync( async(req,res)=>{
    // const authHeader = req.headers.authorization;

    // if (!authHeader) {
    //     return res.status(401).send("Unauthorized");
    // }

    // const base64Credentials = authHeader.split(' ')[1];
    // const credentials = Buffer.from(base64Credentials, 'base64').toString();
    // const [username, password] = credentials.split(':');

    // if (username !== 'payment_app' || password !== 'stigasoft123456') {
    //     return res.status(401).send("Invalid credentials");
    // }

    console.log("Webhook verified:--- ", req.body);
    console.log("--------------------");
    // console.log("payload verified:---- ", req.body.payload);
    // console.log("--------------------");
    // console.log("PaymentDetails verified:---- ", req.body.payload.paymentDetails);
    // console.log("++++++++++++++++++++++");
    // console.log("splitInstruments verified:---- ", req.body.payload.paymentDetails[0].splitInstruments);
    // console.log("++++++++++++++++++++++");
    // console.log(req.headers);
    // console.log("-=-=-=-=-=-=-=-=-=-=-");

    res.status(200).send({
        status: "OK"
    })
})
