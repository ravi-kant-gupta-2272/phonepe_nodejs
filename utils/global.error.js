import { Prisma } from '../generated/prisma/client.ts';
import { USER_ERROR_MESSAGES, AUTH_ERROR_MESSAGES} from './app.constant.js';
import logger from './logger.js';


function extractPrismaArgumentError(message) {

  const match = message.match(/Argument `[^`]+`:[\s\S]*/);

  if (!match) return USER_ERROR_MESSAGES.INVALID_PRISMA_QUERY;

  const errorMessage = match[0].replace(/^Argument\s+/i, '');

  return `${errorMessage}`;
}

const globalError = (err, req, res, next) => {
    
    logger.error(err.message, { stack: err.stack });

    let statusCode = err.statusCode || 500;

    if (err.name === USER_ERROR_MESSAGES.JSON_WEB_TOKEN_ERROR) {
        statusCode = 400;
        err.message = AUTH_ERROR_MESSAGES.INVALID_TOKEN;
    }

    if (err.name === USER_ERROR_MESSAGES.TOKEN_EXPIRE_ERROR) {
        statusCode = 400;
        err.message = AUTH_ERROR_MESSAGES.TOKEN_EXPIRED;
    }

    if (err instanceof Prisma.PrismaClientKnownRequestError) {
        switch (err.code) {
            case 'P2002':
                err.message = `Duplicate value for ${err.meta?.target}`;
            case 'P2025':
                err.message = 'Record not found';
            case 'P2003':
                err.message = 'Foreign key constraint failed';
            default:
                throw err;
        }
    }

    if (err instanceof Prisma.PrismaClientValidationError) {
        const message = extractPrismaArgumentError(err.message);
        err.message = message;
    }

    res.status(statusCode).json({
        status: err.status || "error",
        message: err.message || 'Internal Server Error',
    });

};

export default globalError;
