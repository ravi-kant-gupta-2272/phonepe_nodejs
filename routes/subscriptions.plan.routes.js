import express from 'express';
import {
    createSubscriptionPlan, 
    getPlansByMerchant, 
    updateSubscriptionPlan,
    deleteSubscriptionPlan
} from '../controllers/subscription plans/subscription.plans.controller.js';
import authController from '../middlewares/auth.controller.js';

const subscriptionsPlanRouter = express.Router();

// Route to create a subscription plan
subscriptionsPlanRouter.post('/create', authController, createSubscriptionPlan);

// Route to Get subscription plans by Merchant Id
subscriptionsPlanRouter.get('/get/:merchantId', authController, getPlansByMerchant);

// Route to Update subscription plans
subscriptionsPlanRouter.post('/update', authController, updateSubscriptionPlan);

// Route to Delete subscription plans
subscriptionsPlanRouter.delete('/delete/:id', authController, deleteSubscriptionPlan);


export default subscriptionsPlanRouter;