const cors = require("cors");
const winston = require("winston");

// Logger setup
const logger = winston.createLogger({
    level: "info",
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.printf(({ timestamp, level, message }) => `${timestamp} [${level.toUpperCase()}]: ${message}`)
    ),
    transports: [new winston.transports.Console()]
});

// Define allowed origins dynamically
const allowedOrigins = [
    "http://localhost:5173"
];

// CORS Configuration
const corsOptions = {
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            logger.warn(`🚨 Blocked CORS request from unauthorized origin: ${origin}`);
            callback(new Error("CORS policy violation"), false);
        }
    },
    credentials: true, // Allow credentials (cookies, headers)
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"], // Explicitly allow common methods
    allowedHeaders: ["Content-Type", "Authorization"], // Restrict allowed headers
    optionsSuccessStatus: 204, // Use 204 for better preflight performance
};

// Middleware to log incoming requests
const logCorsRequests = (req, res, next) => {
    logger.info(`🌐 Incoming Request from Origin: ${req.headers.origin || "Unknown"}`);
    next();
};

module.exports = { corsOptions, logCorsRequests };