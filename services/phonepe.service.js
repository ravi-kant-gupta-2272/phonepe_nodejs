import axios from "axios";
import AppError from ".././utils/app.error.js"
import config from "../config/config.js";

class PhonePeWrapper {
  constructor() {
    this.token = null;
    this.tokenExpiry = 0;
  }

  async getToken({ clientId, clientVersion, clientSecret }) {

    // Reuse token if still valid
    // console.log(this.token)
    if (this.token && Date.now() < this.tokenExpiry) {
      // console.log("-=-=-=-=-=-=11111")
      return this.token;
    }

    const data = new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      client_version: clientVersion,
      grant_type: "client_credentials",
    });

    try {
      const response = await axios.post(
        `${config.base_url}/apis/pg-sandbox/v1/oauth/token`,
        data,
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
        }
      );

      const res = response.data;

      // Store token + expiry
      this.token = res.access_token;

      // expires_at is usually in seconds (epoch)
      this.tokenExpiry = res.expires_at * 1000;

      return this.token;
    } catch (error) {
      console.error("Token API failed");
      console.error("Status:", error.response?.status);
      console.error("Response:", error.response?.data);
      throw new AppError(error.response?.data, error.response?.status);
    }
  }

  // ***** Create Auto pay mandate Method *****//
  async createAutopayOrder(arg) {
    const {
      clientId, 
      clientVersion, 
      clientSecret,
      trailAmount,
      message,
      maxamount,
      frequency,
      redirectUrl,
      cancelRedirectUrl,
      subscriptionStartAt,
      subscriptionExpireAt
      } = arg;
        
    const token = await this.getToken({
      clientId: clientId,
      clientVersion: clientVersion,
      clientSecret: clientSecret
    });

    // console.log(`TOKEN---- ${token}`);
    const expireAt =  Date.now() + subscriptionExpireAt * 24 * 60 * 60 * 1000;
    // console.log(`-----0==ExpireAt ${expireAt}`);
    const startAfter5Days = Date.now() + subscriptionStartAt * 24 * 60 * 60 * 1000;
    // console.log(`-----1==startAfter5Days ${startAfter5Days}`);
    const merchantOrderId = `ORD_${Date.now()}`;
    const subscriptionId = `SUB_${Date.now()}`;
    // console.log(`-----==orderId ${merchantOrderId}`);
    console.log(`-----==message==== ${message}`);

    const payload = {
      merchantOrderId: merchantOrderId,
      amount: trailAmount,
      metaInfo: {
          udf1: "App Name.",
          udf2: "App Id."
      },
      paymentFlow: {
        type: "SUBSCRIPTION_CHECKOUT_SETUP",
        message: message,
        merchantUrls: {
          redirectUrl: redirectUrl,
          cancelRedirectUrl: cancelRedirectUrl,
        },
        subscriptionDetails: {
          subscriptionType: "RECURRING",
          merchantSubscriptionId: subscriptionId,
          authWorkflowType: "PENNY_DROP",//TRANSACTION
          amountType: "FIXED",
          maxAmount: maxamount,
          frequency: frequency,
          productType: "UPI_MANDATE",
          startAt: startAfter5Days,
          expireAt: expireAt,
        },
      },
    };

    // console.log(`-----2==payload ${payload}`);

    try {
      const { data } = await axios.post(
        `${config.base_url}/apis/pg-sandbox/checkout/v2/sdk/order`,
        payload,
        {
          headers: {
            Authorization: `O-Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      // console.log(`-----3== ${data}`);
      return {...data, merchantOrderId};
    } catch (error) {
      return new AppError(error, 400);
    }

  }

// ***** Subscription Order Status Method *****//
  async checkOrderStatus({
    clientId,
    clientVersion,
    clientSecret,
    merchantOrderId
  }) {

    const token = await this.getToken({
      clientId: clientId,
      clientVersion: clientVersion,
      clientSecret: clientSecret
    });

    // console.log(`TOKEN---- ${token}`);

    const requestHeaders = {
      Authorization: `O-Bearer ${token}`,
      "Content-Type": "application/json"
    };

    const options = {
      method: 'GET',
      url: `${config.base_url}/apis/pg-sandbox/checkout/v2/order/${merchantOrderId}/status`,
      headers: requestHeaders,
    };

    try {
      const response = await axios.request(options);
      // console.log("-=-=-=-=-=-=-=-222222");
      // console.log(response);
      return response.data;
    } catch (error) {
      // console.log("-=-=-=-=-=-=-=-7777777");
      // console.error(error);
      return new AppError(error, 400);
    }
  }

// ***** Subscription Status Method *****//
  async subscriptionStatus({
    clientId,
    clientVersion,
    clientSecret,
    subscriptionId
  }) {

    const token = await this.getToken({
      clientId: clientId,
      clientVersion: clientVersion,
      clientSecret: clientSecret
    });

    // console.log(`TOKEN---- ${token}`);

    const requestHeaders = {
      Authorization: `O-Bearer ${token}`,
      "Content-Type": "application/json"
    };

    const options = {
      method: 'GET',
      url: `${config.base_url}/apis/pg-sandbox/subscriptions/v2/${subscriptionId}/status?details=true`,
      headers: requestHeaders,
    };

    try {
      const response = axios.request(options);
      // console.log("-=-=-=-=-=-=-=-222222");
      // console.log(response.data);
      return response.data;
    } catch (error) {
      // console.log("-=-=-=-=-=-=-=-7777777");
      // console.error(error);
      return new AppError(error, 400);
    }

  }

// ***** Notify Redemption Method *****//
  async notifyRedemption({
    clientId, 
    clientVersion, 
    clientSecret,
    merchantSubscriptionId,
    amount,
    message
  }){
    try {
      const token = await this.getToken({
        clientId: clientId,
        clientVersion: clientVersion,
        clientSecret: clientSecret
      });

      // console.log(`TOKEN---- ${token}`);
    
      const requestHeaders = {
        Authorization: `O-Bearer ${token}`,
        "Content-Type": "application/json"
      };

      const requestBody = {
        "amount": amount,
        // "expireAt": 1620891733101,
        "metaInfo": {
          "udf1": message
        },
        "paymentFlow": {
          "type": "SUBSCRIPTION_REDEMPTION",
          "merchantSubscriptionId": merchantSubscriptionId,
          "redemptionRetryStrategy": "STANDARD",  // Auto debit handle by phonepe pg
          "autoDebit": true // Deduct the amount 24 hours after notification by PhonePe
        }
      };

      const options = {
        method: 'POST',
        url: `${config.base_url}/apis/pg-sandbox/subscriptions/v2/notify`,
        headers: requestHeaders,
        data: requestBody
      };

      const response = await axios.request(options);
      // console.log(response.data);
      return response.body;
    } catch (error) {
      // console.log(error);
      return new AppError(error, 400);
    }
  }

  async subscriptionCancel({
    clientId, 
    clientVersion, 
    clientSecret,
    merchantSubscriptionId
  }){
    try {

      const token = await this.getToken({
        clientId: clientId,
        clientVersion: clientVersion,
        clientSecret: clientSecret
      });

      // console.log(`TOKEN---- ${token}`);

      const requestHeaders = {
        "Content-Type": "application/json",
        "Authorization": `O-Bearer ${token}`
      };

      const requestBody = {
        "merchantSubscriptionId": `${merchantSubscriptionId}`
      };

      const options = {
        method: 'POST',
        url: `${config.base_url}/apis/pg-sandbox/subscriptions/v2/${merchantSubscriptionId}/cancel`,
        headers: requestHeaders,
        data: requestBody
      };

      const response = await axios.request(options);
        
      // console.log(response.data);
      return response.data;
    } catch (error) {
      // console.log(error);
      return new AppError(error, 400);
    }
  }

}

export default new PhonePeWrapper;