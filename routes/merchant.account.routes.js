import express from 'express';
import {addMerchantAccount} from '../controllers/phonepe merchant/merchant.controller.js'

const merchantRoute = express.Router();

// merchant route to Add Merchants accounts
merchantRoute.post('/create',addMerchantAccount);

export default merchantRoute;
