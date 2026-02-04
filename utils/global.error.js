

const globalError = (err, req, res, next) => {
    let statusCode = err.statusCode || 500;

    if (err.name === 'JsonWebTokenError') {
        statusCode = 400;
        err.message = 'Invalid token';
    }

    if (err.name === 'TokenExpiredError') {
        statusCode = 400;
        err.message = 'Token expired';
    }

    res.status(statusCode).json({
        status: err.status || "error",
        message: err.message || 'Internal Server Error',
    });

};

export default globalError;
