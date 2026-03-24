import crypto from 'crypto';
import config from '../config/config.js';

const ALGORITHM = 'aes-256-gcm';
const SECRET_KEY = Buffer.from(config.encryption_key, 'hex');
const IV_LENGTH = 12;

export function encrypt(text:string) {
  if (!text) return text;

  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, SECRET_KEY, iv);

  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  const authTag = cipher.getAuthTag().toString('hex');

  return `${iv.toString('hex')}:${authTag}:${encrypted}`;
}

export function decrypt(encryptedText:string) {
  if (!encryptedText) return encryptedText;

  const parts = encryptedText.split(':');
  if (parts.length !== 3) {
    return encryptedText;
  }

  const [ivHex, authTagHex, encrypted] = parts;

  if (ivHex.length !== 24) {
    throw new Error('Invalid IV length');
  }

  const decipher = crypto.createDecipheriv(
    ALGORITHM,
    SECRET_KEY,
    Buffer.from(ivHex, 'hex')
  );

  decipher.setAuthTag(Buffer.from(authTagHex, 'hex'));

  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
}

