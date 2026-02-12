import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/prisma/client.ts';
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
        try {
          ENCRYPT_FIELDS.forEach(field => {
          if (args.data?.[field]) {
            args.data[field] = encrypt(args.data[field]);
            // console.log(args.data[field]);
          }
        });

        return query(args);
        } catch (error) {
          handlePrismaError(err);
        }
        
      },

       // Update with encryption
      async update({ args, query }) {
        ENCRYPT_FIELDS.forEach(field => {
          if (args.data?.[field]) {
            args.data[field] = encrypt(args.data[field]);
          }
        });

        return query(args);
      },

      // Decrypt after read
      async findUnique({ args, query }) {
        const result = await query(args);

        if (!result) return result;

        ENCRYPT_FIELDS.forEach(field => {
          if (result[field]) {
            result[field] = decrypt(result[field]);
          }
        });

        return result;
      },

      // Decrypt before read
      async findFirst({ args, query }) {
        const result = await query(args);

        if (!result) return result;

        ENCRYPT_FIELDS.forEach(field => {
          if (result[field]) {
            result[field] = decrypt(result[field]);
          }
        });

        return result;
      },

      // Decrypt before read
      async findMany({ args, query }) {
        const results = await query(args);

        return results.map(row => {
          ENCRYPT_FIELDS.forEach(field => {
            if (row[field]) {
              row[field] = decrypt(row[field]);
            }
          });
          return row;
        });
      },
    },
  },
});

export default prisma;

