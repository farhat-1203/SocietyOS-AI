import { Request, Response, NextFunction } from 'express';
import { generateRandomString } from '@utils/helpers';

/**
 * Middleware to attach a unique request ID to each request
 * Useful for tracing and logging
 */
export const requestIdMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  const requestId = (req.headers['x-request-id'] as string) || generateRandomString(16);

  // Attach to request
  req.headers['x-request-id'] = requestId;

  // Attach to response headers
  res.setHeader('X-Request-ID', requestId);

  // Move to next middleware
  next();
};

export default requestIdMiddleware;
