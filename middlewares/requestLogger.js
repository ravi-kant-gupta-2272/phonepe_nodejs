import logger from "../utils/logger.js";

const requestLogger = (req, res, next) => {
  const start = Date.now();

  res.on("finish", () => {
    const duration = Date.now() - start;

    let requestBody = req.body;

    if (requestBody && typeof requestBody === "object") {
      requestBody = { ...requestBody };

      if (requestBody.password) {
        requestBody.password = "****";
      }
    }

    logger.info("HTTP Request", {
      method: req.method,
      url: req.originalUrl,
      status: res.statusCode,
      duration: `${duration}ms`,
      requestBody: requestBody,
      responseBody: res.send,
      ip: req.ip,
    });
  });

  next();
};

export default requestLogger;
