import { Request, Response, NextFunction } from 'express';
import logger from '@utils/logger';

/**
 * Request logging middleware
 * Logs incoming requests and their response times
 */
export const loggingMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  const startTime = Date.now();
  const requestId = req.headers['x-request-id'] as string;

  // Log incoming request
  logger.debug(`[${requestId}] ${req.method} ${req.path}`, {
    query: req.query,
    body: req.body,
  });

  // Intercept response end
  const originalEnd = res.end;
  res.end = function (chunk?: any, encoding?: any): Response {
    const duration = Date.now() - startTime;
    const statusCode = res.statusCode;

    // Determine log level based on status code
    const logFn = statusCode >= 500 ? logger.error : logger.debug;

    logFn(`[${requestId}] ${req.method} ${req.path} - ${statusCode} (${duration}ms)`);

    return originalEnd.call(this, chunk, encoding);
  };

  next();
};

export default loggingMiddleware;
