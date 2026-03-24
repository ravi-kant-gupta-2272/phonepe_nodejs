import crypto from "crypto";
import dbConfig from "../config/config.js";

export const verifyWebhookAuth = (authHeader: string) => {
  const USERNAME = dbConfig.webhook.username;
  const PASSWORD = dbConfig.webhook.password;

  const expectedHash = crypto
    .createHash("sha256")
    .update(`${USERNAME}:${PASSWORD}`)
    .digest("hex");

  return authHeader === expectedHash;
};