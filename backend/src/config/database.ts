import mongoose from 'mongoose';
import env from './env';
import logger from '@utils/logger';

export const connectDB = async (): Promise<void> => {
  try {
    logger.info(`Connecting to MongoDB: ${env.MONGODB_URI}`);

    await mongoose.connect(env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    logger.info('✓ MongoDB connected successfully');

    // Connection event handlers
    mongoose.connection.on('disconnected', () => {
      logger.warn('MongoDB disconnected');
    });

    mongoose.connection.on('error', (error: Error) => {
      logger.error('MongoDB connection error:', error);
    });

    mongoose.connection.on('reconnected', () => {
      logger.info('✓ MongoDB reconnected');
    });
  } catch (error) {
    logger.error('Failed to connect to MongoDB:', error);
    throw error;
  }
};

export const disconnectDB = async (): Promise<void> => {
  try {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
      logger.info('✓ MongoDB disconnected');
    }
  } catch (error) {
    logger.error('Failed to disconnect from MongoDB:', error);
    throw error;
  }
};

export default mongoose;
