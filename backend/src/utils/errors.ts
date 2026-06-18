import { HTTP_STATUS, ERROR_CODES } from '@config/constants';

export interface ErrorDetails {
  code: string;
  message: string;
  statusCode: number;
  details?: Record<string, unknown>;
}

/**
 * Base application error class
 * All custom errors should extend this class
 */
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly details?: Record<string, unknown>;

  constructor(
    statusCode: number,
    code: string,
    message: string,
    details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;

    // Maintain proper prototype chain
    Object.setPrototypeOf(this, AppError.prototype);
  }

  toJSON(): ErrorDetails {
    return {
      code: this.code,
      message: this.message,
      statusCode: this.statusCode,
      ...(this.details && { details: this.details }),
    };
  }
}

/**
 * Validation error - 400 Bad Request
 * Used when input validation fails
 */
export class ValidationError extends AppError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(HTTP_STATUS.BAD_REQUEST, ERROR_CODES.VALIDATION_ERROR, message, details);
    this.name = 'ValidationError';
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}

/**
 * Authentication error - 401 Unauthorized
 * Used when authentication fails or token is invalid
 */
export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication failed') {
    super(HTTP_STATUS.UNAUTHORIZED, ERROR_CODES.AUTH_ERROR, message);
    this.name = 'AuthenticationError';
    Object.setPrototypeOf(this, AuthenticationError.prototype);
  }
}

/**
 * Authorization error - 403 Forbidden
 * Used when user lacks required permissions
 */
export class AuthorizationError extends AppError {
  constructor(message: string = 'Access denied') {
    super(HTTP_STATUS.FORBIDDEN, ERROR_CODES.FORBIDDEN, message);
    this.name = 'AuthorizationError';
    Object.setPrototypeOf(this, AuthorizationError.prototype);
  }
}

/**
 * Not found error - 404 Not Found
 * Used when a resource doesn't exist
 */
export class NotFoundError extends AppError {
  constructor(resource: string, id?: string) {
    const message = id ? `${resource} with id ${id} not found` : `${resource} not found`;

    super(HTTP_STATUS.NOT_FOUND, ERROR_CODES.NOT_FOUND, message);
    this.name = 'NotFoundError';
    Object.setPrototypeOf(this, NotFoundError.prototype);
  }
}

/**
 * Conflict error - 409 Conflict
 * Used when there's a conflict with existing data
 */
export class ConflictError extends AppError {
  constructor(message: string) {
    super(HTTP_STATUS.CONFLICT, ERROR_CODES.CONFLICT, message);
    this.name = 'ConflictError';
    Object.setPrototypeOf(this, ConflictError.prototype);
  }
}

/**
 * Internal server error - 500 Internal Server Error
 * Used for unexpected server errors
 */
export class InternalServerError extends AppError {
  constructor(message: string = 'Internal server error') {
    super(HTTP_STATUS.INTERNAL_SERVER_ERROR, ERROR_CODES.INTERNAL_ERROR, message);
    this.name = 'InternalServerError';
    Object.setPrototypeOf(this, InternalServerError.prototype);
  }
}

/**
 * Helper to check if an error is an AppError
 */
export const isAppError = (error: unknown): error is AppError => {
  return error instanceof AppError;
};

/**
 * Helper to convert unknown errors to AppError
 */
export const toAppError = (error: unknown): AppError => {
  if (isAppError(error)) {
    return error;
  }

  if (error instanceof Error) {
    return new InternalServerError(error.message);
  }

  return new InternalServerError('An unknown error occurred');
};
