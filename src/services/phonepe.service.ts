import axios, { AxiosError } from "axios";
import AppError from "../utils/app.error.js"
import config from "../config/config.js";


interface CreateAutopayOrderArgs {
  clientId: string;
  clientVersion: number;
  clientSecret: string;
  trailAmount: number;
  message: string;
  maxamount: number;
  frequency: string;
  redirectUrl: string;
  cancelRedirectUrl: string;
  subscriptionStartAt: number;
  subscriptionExpireAt: number;
}

class PhonePeWrapper {
  
  token: string | null;
  tokenExpiry: number;

  constructor() {
    this.token = null;
    this.tokenExpiry = 0;
  }

  async getToken({ clientId, clientVersion, clientSecret }: { clientId: string; clientVersion: number; clientSecret: string }) {
   
    if (this.token && Date.now() < this.tokenExpiry) {
      return this.token;
    }

    const data = new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      client_version: clientVersion.toString(),
      grant_type: "client_credentials",
    });

    try {
      const response = await axios.post(
        `${config.phonepe_base_url as string}/apis/pg-sandbox/v1/oauth/token`,
        data,
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
        }
      );

      const res = response.data;

      this.token = res.access_token;

      this.tokenExpiry = res.expires_at * 1000;
      return this.token;
    } catch (error) {
      const err = error as AxiosError;
       const statusCode = err.response?.status || 500;

      return new AppError(
         err.message,
        statusCode
      );
    }
  }

  // ***** Create Auto pay mandate Method *****//
  async createAutopayOrder(arg: CreateAutopayOrderArgs) {
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

    const expireAt =  Date.now() + subscriptionExpireAt * 24 * 60 * 60 * 1000;
    const startAfter5Days = Date.now() + subscriptionStartAt * 24 * 60 * 60 * 1000;
    const merchantOrderId = `ORD_${Date.now()}`;
    const subscriptionId = `SUB_${Date.now()}`;

    const payload = {
      merchantOrderId: merchantOrderId,
      amount: trailAmount,
      metaInfo: {
          udf1: `merchantOrderId ${merchantOrderId}`,
          udf2: `subscriptionId ${subscriptionId}`,
          udf3: message
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
          authWorkflowType: "TRANSACTION",
          amountType: "FIXED",
          maxAmount: maxamount,
          frequency: frequency,
          productType: "UPI_MANDATE",
          startAt: startAfter5Days,
          expireAt: expireAt,
        },
      },
    };


    try {
      const { data } = await axios.post(
        `${config.phonepe_base_url}/apis/pg-sandbox/checkout/v2/sdk/order`,
        payload,
        {
          headers: {
            Authorization: `O-Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      return {...data, merchantOrderId};
    } catch (error) {
      if (error instanceof Error) {
        return new AppError(error.message, 400);

      }else if( error instanceof AxiosError ){

        const err = error as AxiosError;
        const statusCode = err.response?.status || 500;

        return new AppError(
          err.message,
          statusCode
        );

      }
      return new AppError("Unknown error", 400);
    }
  }

// ***** Subscription Order Status Method *****//
  async checkOrderStatus({
    clientId,
    clientVersion,
    clientSecret,
    merchantOrderId
  }: { clientId: string; clientVersion: number; clientSecret: string; merchantOrderId:string }) {

    const token = await this.getToken({
      clientId: clientId,
      clientVersion: clientVersion,
      clientSecret: clientSecret
    });

    const requestHeaders = {
      Authorization: `O-Bearer ${token}`,
      "Content-Type": "application/json"
    };

    const options = {
      method: 'GET',
      url: `${config.phonepe_base_url}/apis/pg-sandbox/checkout/v2/order/${merchantOrderId}/status`,
      headers: requestHeaders,
    };

    try {
      const response = await axios.request(options);
      return response.data;
    } catch (error) {
      if (error instanceof Error) {
        return new AppError(error.message, 400);

      }else if( error instanceof AxiosError ){

        const err = error as AxiosError;
        const statusCode = err.response?.status || 500;

        return new AppError(
          err.message,
          statusCode
        );

      }
      return new AppError("Unknown error", 400);
    }
  }

// ***** Subscription Status Method *****//
  async subscriptionStatus({
    clientId,
    clientVersion,
    clientSecret,
    subscriptionId
  }: { clientId: string; clientVersion: number; clientSecret: string; subscriptionId:string }) {

    const token = await this.getToken({
      clientId: clientId,
      clientVersion: clientVersion,
      clientSecret: clientSecret
    });

    const requestHeaders = {
      Authorization: `O-Bearer ${token}`,
      "Content-Type": "application/json"
    };

    const options = {
      method: 'GET',
      url: `${config.phonepe_base_url}/apis/pg-sandbox/subscriptions/v2/${subscriptionId}/status?details=true`,
      headers: requestHeaders,
    };

    try {
      const response = await axios.request(options);
      return response.data;
    } catch (error) {
      if (error instanceof Error) {
        return new AppError(error.message, 400);

      }else if( error instanceof AxiosError ){

        const err = error as AxiosError;
        const statusCode = err.response?.status || 500;

        return new AppError(
          err.message,
          statusCode
        );

      }
      return new AppError("Unknown error", 400);
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
  }: { clientId: string; 
    clientVersion: number; 
    clientSecret: string; 
    merchantSubscriptionId:string; amount:number; message:string }){
    try {
      const token = await this.getToken({
        clientId: clientId,
        clientVersion: clientVersion,
        clientSecret: clientSecret
      });
    
      const requestHeaders = {
        Authorization: `O-Bearer ${token}`,
        "Content-Type": "application/json"
      };

      const requestBody = {
        "merchantOrderId": "ORD_1773919398836",
        "amount": amount,
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
        url: `${config.phonepe_base_url}/apis/pg-sandbox/subscriptions/v2/notify`,
        headers: requestHeaders,
        data: requestBody
      };

      const response = await axios.request(options);
      return response.data;
    } catch (error) {
      if (error instanceof Error) {
        return new AppError(error.message, 400);

      }else if( error instanceof AxiosError ){

        const err = error as AxiosError;
        const statusCode = err.response?.status || 500;

        return new AppError(
          err.message,
          statusCode
        );

      }
      return new AppError("Unknown error", 400);
    }
  }

  async subscriptionCancel({
    clientId, 
    clientVersion, 
    clientSecret,
    merchantSubscriptionId
  }: { clientId: string; 
    clientVersion: number; 
    clientSecret: string; 
    merchantSubscriptionId:string }){
    try {

      const token = await this.getToken({
        clientId: clientId,
        clientVersion: clientVersion,
        clientSecret: clientSecret
      });

      const requestHeaders = {
        "Content-Type": "application/json",
        "Authorization": `O-Bearer ${token}`
      };

      const requestBody = {
        "merchantSubscriptionId": `${merchantSubscriptionId}`
      };

      const options = {
        method: 'POST',
        url: `${config.phonepe_base_url}/apis/pg-sandbox/subscriptions/v2/${merchantSubscriptionId}/cancel`,
        headers: requestHeaders,
        data: requestBody
      };

      const response = await axios.request(options);
        
      return response.data;
    } catch (error) {
      if (error instanceof Error) {
        return new AppError(error.message, 400);

      }else if( error instanceof AxiosError ){

        const err = error as AxiosError;
        const statusCode = err.response?.status || 500;

        return new AppError(
          err.message,
          statusCode
        );

      }
      return new AppError("Unknown error", 400);
    }
  }

}

export default new PhonePeWrapper;
