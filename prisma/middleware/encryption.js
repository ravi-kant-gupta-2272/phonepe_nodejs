import { encrypt, decrypt } from '../../utils/crypto.js';

const ENCRYPT_FIELDS = ['client_secret', 'webhook_password'];

export const encryptionMiddleware = async (params, next) => {
  // Encrypt before write
  if (params.model === 'Merchant' && ['create', 'update'].includes(params.action)) {
    ENCRYPT_FIELDS.forEach(field => {
      if (params.args.data?.[field]) {
        params.args.data[field] = encrypt(params.args.data[field]);
      }
    });
  }

  const result = await next(params);

  // Decrypt after read
  if (params.model === 'Merchant' && result) {
    ENCRYPT_FIELDS.forEach(field => {
      if (result[field]) {
        result[field] = decrypt(result[field]);
      }
    });
  }

  return result;
};
