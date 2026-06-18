import type { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import env from '@config/env';
import type { AuthenticatedRequest } from '@/types/express';
import { AuthenticationError, AuthorizationError } from '@utils/errors';

/**
 * Verify and decode JWT token
 */
const verifyToken = (token: string): string | jwt.JwtPayload => {
  try {
    return jwt.verify(token, env.JWT_SECRET);
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new AuthenticationError('Token expired');
    }
    if (error instanceof jwt.JsonWebTokenError) {
      throw new AuthenticationError('Invalid token');
    }
    throw new AuthenticationError('Token verification failed');
  }
};

/**
 * Authentication middleware
 * Verifies JWT token and attaches user to request
 *
 * Expected token format: "Bearer <token>"
 */
export const authMiddleware = (
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction
): void => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      throw new AuthenticationError('No token provided');
    }

    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      throw new AuthenticationError('Invalid token format');
    }

    const token = parts[1];
    const decoded = verifyToken(token);

    // Attach user to request
    req.user = decoded as AuthenticatedRequest['user'];

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Permission check middleware
 * Checks if user has required permission
 *
 * Usage: checkPermission('resource', 'action')
 * Checks for permission: 'resource:action' or '*:*' (admin)
 */
export const checkPermission = (resource: string, action: string) => {
  return (req: AuthenticatedRequest, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new AuthenticationError('Not authenticated'));
    }

    const requiredPermission = `${resource}:${action}`;
    const hasPermission =
      req.user.permissions.includes(requiredPermission) || req.user.permissions.includes('*:*');

    if (!hasPermission) {
      return next(new AuthorizationError(`Missing permission: ${requiredPermission}`));
    }

    next();
  };
};

/**
 * Role check middleware
 * Checks if user has one of the required roles
 *
 * Usage: checkRole('admin', 'moderator')
 */
export const checkRole = (...roles: string[]) => {
  return (req: AuthenticatedRequest, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new AuthenticationError('Not authenticated'));
    }

    const hasRole = req.user.roles.some((role) => roles.includes(role));

    if (!hasRole) {
      return next(new AuthorizationError(`Required one of roles: ${roles.join(', ')}`));
    }

    next();
  };
};

export default {
  authMiddleware,
  checkPermission,
  checkRole,
};
