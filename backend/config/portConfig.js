const detectPort = require("detect-port").default; // Fix for newer versions
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

// Function to find an available port in a given range
const findAvailablePort = async (start, end) => {
    for (let port = start; port <= end; port++) {
        const availablePort = await detectPort(port); // Use detectPort instead of detect
        if (availablePort === port) return port;
    }
    return null;
};

// Function to start the server dynamically
const startServer = async (app, defaultPort, minPort, maxPort, maxRetries = 5) => {
    let retries = 0;
    let port = defaultPort;

    while (retries < maxRetries) {
        try {
            port = await findAvailablePort(minPort, maxPort);
            if (!port) throw new Error("No available ports found in the specified range.");

            const server = app.listen(port, () => {
                logger.info(`🚀 Server running at http://localhost:${port}`);
            });

            // Graceful shutdown handling
            const shutdown = () => {
                logger.warn("⚠️ Server shutting down...");
                server.close(() => {
                    logger.info("✅ Server closed. Exiting process...");
                    process.exit(0);
                });
            };

            process.on("SIGINT", shutdown);
            process.on("SIGTERM", shutdown);

            return server;
        } catch (error) {
            logger.error(`❌ Port allocation error: ${error.message}`);
            retries++;
        }
    }

    logger.error("🚨 Max retries reached. Server failed to start.");
    process.exit(1);
};

module.exports = { findAvailablePort, startServer };