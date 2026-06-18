import type { Response, NextFunction } from 'express';
import type { AuthenticatedRequest } from '@/types/express';
import { AuthenticationError } from '@utils/errors';
import { isValidObjectId } from '@utils/helpers';

/**
 * Tenancy middleware
 * Extracts and validates societyId for multi-tenant operations
 *
 * societyId can come from:
 * 1. Query parameter: ?societyId=xxx
 * 2. JWT token (req.user.societyId)
 * 3. Request header: X-Society-Id
 *
 * Priority: Query > Header > JWT token
 */
export const tenancyMiddleware = (
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction
): void => {
  try {
    // Get societyId from various sources
    const societyIdFromQuery = req.query.societyId as string;
    const societyIdFromHeader = req.headers['x-society-id'] as string;
    const societyIdFromUser = req.user?.societyId;

    // Priority: Query > Header > User token
    const societyId = societyIdFromQuery || societyIdFromHeader || societyIdFromUser;

    if (!societyId) {
      throw new AuthenticationError('societyId is required');
    }

    if (!isValidObjectId(societyId)) {
      throw new AuthenticationError('Invalid societyId format');
    }

    // Attach to request
    req.tenancy = {
      societyId,
      userId: req.user?.userId || '',
    };

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Tenancy validation middleware
 * Ensures request has valid tenancy context
 * Use this if you need tenancy but don't have authentication
 */
export const validateTenancy = (
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction
): void => {
  if (!req.tenancy || !req.tenancy.societyId) {
    return next(new AuthenticationError('Invalid tenancy context'));
  }

  next();
};

export default {
  tenancyMiddleware,
  validateTenancy,
};
