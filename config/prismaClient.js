import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient, Prisma } from '../generated/prisma/client.ts';
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

function decryptResult(result) {
  if (!result) return result;

  const decrypted = { ...result };

  ENCRYPT_FIELDS.forEach(field => {
    if (decrypted[field]) {
      try {
        decrypted[field] = decrypt(decrypted[field]);
      } catch (e) {
        console.error(`Decryption failed for field: ${field}`);
        decrypted[field] = null; // or keep encrypted value
      }
    }
  });

  return decrypted;
}

function handlePrismaError(err) {
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    switch (err.code) {
      case 'P2002':
        throw new Error(`Duplicate value for ${err.meta?.target}`);
      case 'P2025':
        throw new Error('Record not found');
      case 'P2003':
        throw new Error('Foreign key constraint failed');
      default:
        throw err;
    }
  }

  if (err instanceof Prisma.PrismaClientValidationError) {
    const message = extractPrismaArgumentError(err.message);
    throw new Error(message);
  }

  throw err;
}

function extractPrismaArgumentError(message) {

  const match = message.match(/Argument `[^`]+`:[\s\S]*/);

  if (!match) return 'Invalid Prisma query';

  const errorMessage = match[0].replace(/^Argument\s+/i, '');

  return `${errorMessage}`;
}


// Extend with encryption logic
const prisma = basePrisma.$extends({
  query: {
    merchant: {
      async create({ args, query }) {
        try {
          const data = { ...args.data };

          ENCRYPT_FIELDS.forEach(field => {
            if (data?.[field]) {
              data[field] = encrypt(data[field]);
            }
          });

          return await query({ ...args, data });
        } catch (err) {
          handlePrismaError(err);
        }
      },

      async update({ args, query }) {
        try {
          const data = { ...args.data };

          ENCRYPT_FIELDS.forEach(field => {
            if (data?.[field]) {
              data[field] = encrypt(data[field]);
            }
          });

          return await query({ ...args, data });
        } catch (err) {
          handlePrismaError(err);
        }
      },

      async findUnique({ args, query }) {
        try {
          const result = await query(args);
          return decryptResult(result);
        } catch (err) {
          handlePrismaError(err);
        }
      },

      async findFirst({ args, query }) {
        try {
          const result = await query(args);
          return decryptResult(result);
        } catch (err) {
          handlePrismaError(err);
        }
      },

      async findMany({ args, query }) {
        try {
          const results = await query(args);
          return results.map(decryptResult);
        } catch (err) {
          handlePrismaError(err);
        }
      },
    },
  },
});
// const prisma = basePrisma.$extends({
//   query: {
//     merchant: {
//       // 🔐 Encrypt before write
//       async create({ args, query }) {
//         try {
//           ENCRYPT_FIELDS.forEach(field => {
//           if (args.data?.[field]) {
//             args.data[field] = encrypt(args.data[field]);
//             console.log(args.data[field]);
//           }
//         });

//         return query(args);
//         } catch (error) {
//           handlePrismaError(err);
//         }
        
//       },

//       async update({ args, query }) {
//         ENCRYPT_FIELDS.forEach(field => {
//           if (args.data?.[field]) {
//             args.data[field] = encrypt(args.data[field]);
//           }
//         });

//         return query(args);
//       },

//       // Decrypt after read
//       async findUnique({ args, query }) {
//         const result = await query(args);

//         if (!result) return result;

//         ENCRYPT_FIELDS.forEach(field => {
//           if (result[field]) {
//             result[field] = decrypt(result[field]);
//           }
//         });

//         return result;
//       },

//       async findFirst({ args, query }) {
//         const result = await query(args);

//         if (!result) return result;

//         ENCRYPT_FIELDS.forEach(field => {
//           if (result[field]) {
//             result[field] = decrypt(result[field]);
//           }
//         });

//         return result;
//       },

//       async findMany({ args, query }) {
//         const results = await query(args);

//         return results.map(row => {
//           ENCRYPT_FIELDS.forEach(field => {
//             if (row[field]) {
//               row[field] = decrypt(row[field]);
//             }
//           });
//           return row;
//         });
//       },
//     },
//   },
// });

export default prisma;

