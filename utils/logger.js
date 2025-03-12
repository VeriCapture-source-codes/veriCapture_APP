import winston from "winston";
import "winston-mongodb";

const logger = winston.createLogger({
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.simple(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(), // Log to console
    new winston.transports.File({ filename: "errors.log", level: "error" }), // Log errors to file
    new winston.transports.MongoDB({
      db: process.env.MONGO_URI,
      collection: "error_logs",
      level: "error",
    }), // Log errors to MongoDB
  ],
  exceptionHandlers: [
    new winston.transports.Console(), // Log exceptions to console
    new winston.transports.File({ filename: "exceptions.log" }), // Log exceptions to file
    new winston.transports.MongoDB({
      db: process.env.MONGO_URI,
      collection: "exceptions",
    }), // Log exceptions to MongoDB
  ],
  rejectionHandlers: [
    new winston.transports.Console(), // Log rejections to console
    new winston.transports.File({ filename: "rejections.log" }), // Log rejections to file
    new winston.transports.MongoDB({
      db: process.env.MONGO_URI,
      collection: "rejections",
    }), // Log rejections to MongoDB
  ],
});

export default logger;
