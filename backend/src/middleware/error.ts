import type { Request, Response, NextFunction } from 'express';
import logger from '@utils/logger';
import { sendError } from '@utils/response';
import { isAppError, toAppError, AppError } from '@utils/errors';
import { HTTP_STATUS } from '@config/constants';

/**
 * Global error handling middleware
 * Must be registered after all other middleware and routes
 */
export const errorMiddleware = (
  error: unknown,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  const requestId = (req.headers['x-request-id'] as string) || 'unknown';

  // Handle Zod validation errors
  if (error instanceof Error && error.message.includes('ZodError')) {
    const validationError = new AppError(
      HTTP_STATUS.BAD_REQUEST,
      'VALIDATION_ERROR',
      error.message
    );
    sendError(res, validationError.statusCode, {
      code: validationError.code,
      message: validationError.message,
    });
    return;
  }

  // Handle MongoDB validation errors
  if (error instanceof Error && error.name === 'ValidationError') {
    const validationError = new AppError(
      HTTP_STATUS.BAD_REQUEST,
      'VALIDATION_ERROR',
      'Invalid data provided'
    );
    sendError(res, validationError.statusCode, {
      code: validationError.code,
      message: validationError.message,
    });
    return;
  }

  // Handle MongoDB duplicate key errors
  if (error instanceof Error && error.name === 'MongoServerError') {
    const mongoError = error as any;
    if (mongoError.code === 11000) {
      const field = Object.keys(mongoError.keyPattern)[0] || 'field';
      const conflictError = new AppError(
        HTTP_STATUS.CONFLICT,
        'CONFLICT',
        `A record with this ${field} already exists`
      );
      sendError(res, conflictError.statusCode, {
        code: conflictError.code,
        message: conflictError.message,
      });
      return;
    }
  }

  // Convert to AppError if not already
  let appError: AppError;
  if (isAppError(error)) {
    appError = error;
  } else {
    appError = toAppError(error);
  }

  // Log the error
  const logMessage = `[${requestId}] ${appError.name}: ${appError.message}`;
  if (appError.statusCode >= HTTP_STATUS.INTERNAL_SERVER_ERROR) {
    logger.error(logMessage, error);
  } else {
    logger.warn(logMessage);
  }

  // Send error response
  sendError(res, appError.statusCode, {
    code: appError.code,
    message: appError.message,
    ...(appError.details && { details: appError.details }),
  });
};

/**
 * 404 Not Found middleware
 * Should be registered after all routes
 */
export const notFoundMiddleware = (req: Request, _res: Response, next: NextFunction): void => {
  const error = new AppError(
    HTTP_STATUS.NOT_FOUND,
    'NOT_FOUND',
    `Route ${req.method} ${req.path} not found`
  );
  next(error);
};

export default {
  errorMiddleware,
  notFoundMiddleware,
};
