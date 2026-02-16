import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/prisma/client.js';
import dbConfig from './config.js';
import { encrypt, decrypt } from '../utils/crypto.js';

const ENCRYPT_FIELDS = [
  'callback_url',
  'webhook_username',
  'webhook_password',
  'client_id',
  'merchant_id',
  'client_secret'
];

const connectionString = `${dbConfig.db.db_url}`;
const adapter = new PrismaPg({ connectionString });

// Base client
const basePrisma = new PrismaClient({ adapter });

// Extend with encryption logic

const prisma = basePrisma.$extends({
  query: {
    merchant: {
      // Encrypt before write
      async create({ args, query }) {
       const data: any = args.data;
       ENCRYPT_FIELDS.forEach(field => {
          if (data?.[field]) {
            data[field] = encrypt(data[field]);
            console.log(data[field]);
          }
        });

        return query(args);
        
      },

       // Update with encryption
      async update({ args, query }) {
        const data: any = args.data;
        ENCRYPT_FIELDS.forEach(field => {
          if (data?.[field]) {
            data[field] = encrypt(data[field]);
          }
        });

        return query(args);
      },

      // Decrypt after read
      async findUnique({ args, query }) {
        const result = await query(args);

        if (!result) return result;

        const resAny: any = result;
        ENCRYPT_FIELDS.forEach(field => {
          if (resAny[field]) {
            resAny[field] = decrypt(resAny[field]);
          }
        });

        return result;
      },

      // Decrypt before read
      async findFirst({ args, query }) {
        const result = await query(args);

        if (!result) return result;

        const resAny: any = result;
        ENCRYPT_FIELDS.forEach(field => {
          if (resAny[field]) {
            resAny[field] = decrypt(resAny[field]);
          }
        });

        return result;
      },

      // Decrypt before read
      async findMany({ args, query }) {
        const results = await query(args);

        return results.map(row => {
          const rowAny: any = row;
          ENCRYPT_FIELDS.forEach(field => {
            if (rowAny[field]) {
              rowAny[field] = decrypt(rowAny[field]);
            }
          });
          return row;
        });
      },
    },
  },
});

export default prisma;

