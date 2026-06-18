import env from '@config/env';
import { connectDB, disconnectDB } from '@config/database';
import { createApp } from '@/app';
import logger from '@utils/logger';

/**
 * Start the application server
 */
const start = async (): Promise<void> => {
  try {
    logger.info('Starting SocietyOS API server...');

    // Connect to database
    logger.info('Connecting to database...');
    await connectDB();

    // Create Express app
    const app = createApp();

    // Start listening
    const server = app.listen(env.PORT, env.HOST, () => {
      logger.info(`✓ Server running at http://${env.HOST}:${env.PORT}`);
      logger.info(`✓ Environment: ${env.NODE_ENV}`);
      logger.info(`✓ Log level: ${env.LOG_LEVEL}`);
      logger.info(`✓ CORS origin: ${env.CORS_ORIGIN}`);
    });

    // Graceful shutdown
    const shutdown = async (signal: string): Promise<void> => {
      logger.info(`\nReceived ${signal}, shutting down gracefully...`);

      // Stop accepting new connections
      server.close(async () => {
        logger.info('Server closed');

        // Disconnect from database
        try {
          await disconnectDB();
        } catch (error) {
          logger.error('Error disconnecting from database:', error);
        }

        process.exit(0);
      });

      // Force exit after 30 seconds
      setTimeout(() => {
        logger.error('Forced shutdown after 30 seconds');
        process.exit(1);
      }, 30000);
    };

    // Handle shutdown signals
    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));

    // Handle uncaught exceptions
    process.on('uncaughtException', (error) => {
      logger.error('Uncaught exception:', error);
      process.exit(1);
    });

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (reason: any) => {
      logger.error('Unhandled rejection:', { reason });
      process.exit(1);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Start server
if (require.main === module) {
  start();
}

export default start;
