import { Request, Response, NextFunction } from 'express';

/**
 * Wraps async route handlers to catch errors
 * Prevents "unhandled promise rejection" errors
 * Passes caught errors to Express error handler
 */
export const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<void | any>
) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * Type-safe async handler with proper typing
 */
export const createAsyncHandler = <
  ReqBody = unknown,
  ResBody = unknown,
  ReqQuery = unknown,
  ReqParams = unknown,
>(
  handler: (
    req: Request<ReqParams, ResBody, ReqBody, ReqQuery>,
    res: Response<ResBody>,
    next: NextFunction
  ) => Promise<void>
) => {
  return (
    req: Request<ReqParams, ResBody, ReqBody, ReqQuery>,
    res: Response<ResBody>,
    next: NextFunction
  ): void => {
    Promise.resolve(handler(req, res, next)).catch(next);
  };
};

export default asyncHandler;
