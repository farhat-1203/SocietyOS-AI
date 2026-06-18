import type { Response, NextFunction } from 'express';
import type { AuthenticatedRequest } from '@/types/express';
import { AuthorizationError } from '@utils/errors';

/**
 * Permission checking middleware
 * Verifies user has required permission for resource:action
 *
 * Usage: checkPermission('complaints', 'create')
 * Checks for permission: 'complaints:create'
 */
export const checkPermission = (
  resource: string,
  action: string
): ((req: AuthenticatedRequest, _res: Response, next: NextFunction) => Promise<void>) => {
  return async (req: AuthenticatedRequest, _res: Response, next: NextFunction): Promise<void> => {
    if (!req.user) {
      return next(new AuthorizationError('Not authenticated'));
    }

    // Super Admin bypass
    if (req.user.roles.includes('Super Admin')) {
      return next();
    }

    const requiredPermission = `${resource}:${action}`;
    const hasPermission = req.user.permissions.includes(requiredPermission);

    if (!hasPermission) {
      return next(new AuthorizationError(`Missing permission: ${requiredPermission}`));
    }

    next();
  };
};

/**
 * Role checking middleware
 * Verifies user has one of the required roles
 *
 * Usage: checkRole('Society Admin', 'Super Admin')
 */
export const checkRole = (
  ...roles: string[]
): ((req: AuthenticatedRequest, _res: Response, next: NextFunction) => void) => {
  return (req: AuthenticatedRequest, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new AuthorizationError('Not authenticated'));
    }

    const hasRole = req.user.roles.some((role) => roles.includes(role));

    if (!hasRole) {
      return next(new AuthorizationError(`Required one of roles: ${roles.join(', ')}`));
    }

    next();
  };
};

/**
 * Super Admin only middleware
 */
export const requireSuperAdmin = (
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction
): void => {
  if (!req.user) {
    return next(new AuthorizationError('Not authenticated'));
  }

  if (!req.user.roles.includes('Super Admin')) {
    return next(new AuthorizationError('Super Admin access required'));
  }

  next();
};

/**
 * Society Admin or Super Admin middleware
 */
export const requireAdminAccess = (
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction
): void => {
  if (!req.user) {
    return next(new AuthorizationError('Not authenticated'));
  }

  const isAdmin =
    req.user.roles.includes('Society Admin') || req.user.roles.includes('Super Admin');

  if (!isAdmin) {
    return next(new AuthorizationError('Admin access required'));
  }

  next();
};
