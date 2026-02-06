import express from 'express';
import authController from '../middlewares/auth.controller.js';
import {getMerchantAccount, addMerchantAccount, updateMerchantAccount, deleteMerchantAccount} from '../controllers/phonepe merchant/merchant.controller.js'

const merchantRoute = express.Router();

// merchant route to Get Merchants accounts
merchantRoute.get('/get',authController, getMerchantAccount);

// merchant route to Create Merchants accounts
merchantRoute.post('/create',authController, addMerchantAccount);

// merchant route to Update Merchant accounts
merchantRoute.put('/update/:id',authController, updateMerchantAccount);

// merchant route to Delete Merchant accounts
merchantRoute.delete('/delete/:id',authController, deleteMerchantAccount);

export default merchantRoute;