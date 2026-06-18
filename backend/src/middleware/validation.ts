import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';
import { ValidationError } from '@utils/errors';

/**
 * Middleware factory to validate request body against Zod schema
 */
export const validateBody = (schema: ZodSchema) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      const errors = result.error.errors.map((err) => ({
        field: err.path.join('.'),
        message: err.message,
      }));

      const details = {
        errors,
      };

      return next(new ValidationError('Request validation failed', details));
    }

    // Replace body with validated data
    req.body = result.data;
    next();
  };
};

/**
 * Middleware factory to validate request query against Zod schema
 */
export const validateQuery = (schema: ZodSchema) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.query);

    if (!result.success) {
      const errors = result.error.errors.map((err) => ({
        field: err.path.join('.'),
        message: err.message,
      }));

      const details = {
        errors,
      };

      return next(new ValidationError('Query validation failed', details));
    }

    // Replace query with validated data
    req.query = result.data as any;
    next();
  };
};

/**
 * Middleware factory to validate request params against Zod schema
 */
export const validateParams = (schema: ZodSchema) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.params);

    if (!result.success) {
      const errors = result.error.errors.map((err) => ({
        field: err.path.join('.'),
        message: err.message,
      }));

      const details = {
        errors,
      };

      return next(new ValidationError('Parameter validation failed', details));
    }

    // Replace params with validated data
    req.params = result.data as any;
    next();
  };
};

export default {
  validateBody,
  validateQuery,
  validateParams,
};
