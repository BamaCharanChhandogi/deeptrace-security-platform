const app = require('./app');
const env = require('./config/environment');
const db = require('./config/database');
const logger = require('./utils/logger');

async function startServer() {
  try {
    // Verify database connectivity
    await db.raw('SELECT 1');
    logger.info('Database connection established successfully.');

    const server = app.listen(env.PORT, () => {
      logger.info(`DeepTrace API server listening on http://localhost:${env.PORT} [${env.NODE_ENV}]`);
    });

    // Graceful shutdown handling
    const handleShutdown = async (signal) => {
      logger.info(`Received ${signal}. Shutting down gracefully...`);
      server.close(async () => {
        logger.info('HTTP server closed.');
        try {
          await db.destroy();
          logger.info('Database pool drained.');
          process.exit(0);
        } catch (err) {
          logger.error('Error during database teardown: %s', err.message);
          process.exit(1);
        }
      });

      // Force exit after 10 seconds if not gracefully stopped
      setTimeout(() => {
        logger.error('Forced shutdown due to timeout');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', () => handleShutdown('SIGTERM'));
    process.on('SIGINT', () => handleShutdown('SIGINT'));
  } catch (err) {
    logger.error('Failed to initialize server: %s', err.message, { stack: err.stack });
    process.exit(1);
  }
}

startServer();
