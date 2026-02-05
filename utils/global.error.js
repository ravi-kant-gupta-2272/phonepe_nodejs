import { USER_ERROR_MESSAGES, AUTH_ERROR_MESSAGES} from './app.constant.js';

const globalError = (err, req, res, next) => {
    let statusCode = err.statusCode || 500;

    if (err.name === USER_ERROR_MESSAGES.JSON_WEB_TOKEN_ERROR) {
        statusCode = 400;
        err.message = AUTH_ERROR_MESSAGES.INVALID_TOKEN;
    }

    if (err.name === USER_ERROR_MESSAGES.TOKEN_EXPIRE_ERROR) {
        statusCode = 400;
        err.message = AUTH_ERROR_MESSAGES.TOKEN_EXPIRED;
    }

    res.status(statusCode).json({
        status: err.status || "error",
        message: err.message || 'Internal Server Error',
    });

};

export default globalError;
