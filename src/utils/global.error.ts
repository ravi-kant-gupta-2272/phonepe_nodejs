import {Response, Request, ErrorRequestHandler, NextFunction } from 'express'
import { ZodError } from "zod";
import { Prisma } from '../generated/prisma/client.js';
import { USER_ERROR_MESSAGES, AUTH_ERROR_MESSAGES} from './app.constant.js';
import logger from './logger.js';


function extractPrismaArgumentError(message:string) {

  const match = message.match(/Argument `[^`]+`:[\s\S]*/);

  if (!match) return USER_ERROR_MESSAGES.INVALID_PRISMA_QUERY;

  const errorMessage = match[0].replace(/^Argument\s+/i, '');

  return `${errorMessage}`;
}

const globalError: ErrorRequestHandler = (err: any, req: Request, res: Response, next: NextFunction ) => {
    console.log("-=-=-=-=-=-=-=-=-=-=-=-4 -- "+ (err instanceof ZodError));
    logger.error(err.message, { stack: process.env.NODE_ENV === "development" ? err.stack : undefined });
    
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
                statusCode = 400;
                break;
            case 'P2025':
                err.message = 'Record not found';
                statusCode = 400;
                break;
            case 'P2003':
                err.message = 'Foreign key constraint failed';
                statusCode = 400;
                break;
            default:
                statusCode = 400;
                break;
        }
    }

    if (err instanceof Prisma.PrismaClientValidationError) {
        const message = extractPrismaArgumentError(err.message);
        err.message = message;
    }

    if (err instanceof ZodError) {
        // err.message = err.name;
        // console.log(err.message)
        // console.log("ZOD ISSSUES--- "+err.issues.join("-----"))
        // console.log("ZOD NAME--- "+err.name)
        const error = err.issues.map(issue => `${issue.path} -${issue.message.split(":")[1]}`
            
        //     ({
        //     field: issue.path.join("-"),
        //     message: issue.message
        // })
    )
        return res.status(400).json({
            status: "error",
            message: error.join(", "),
        });
    }

    res.status(statusCode).json({
        status: err.status || "error",
        message: err.message || 'Internal Server Error',
    });

};

export default globalError;
