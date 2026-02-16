// import winston from 'winston';
// import DailyRotateFile from "winston-daily-rotate-file";


// const logFormat = winston.format.combine(
//   winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
//   winston.format.errors({ stack: true }),
//   winston.format.json()
// );

// // Rotate transport (auto delete after X days)
// const transport = new DailyRotateFile({
//   filename: "logs/application-%DATE%.log",
//   datePattern: "YYYY-MM-DD",
//   maxFiles: "1d", // Keep logs for 1 days
//   zippedArchive: true, // compress old logs
//   level: "info",
// });

// const errorTransport = new DailyRotateFile({
//   filename: "logs/error-%DATE%.log",
//   datePattern: "YYYY-MM-DD",
//   maxFiles: "1d",
//   zippedArchive: true,
//   level: "error",
// });

// const logger = winston.createLogger({
//   level: "info",
//   format: logFormat,
//   transports: [
//     transport,
//     errorTransport,
//     new winston.transports.Console({
//       format: winston.format.simple(),
//     }),
//   ],
// });

// export default logger;
