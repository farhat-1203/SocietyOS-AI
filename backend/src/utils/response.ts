import { Response } from 'express';
import { HTTP_STATUS } from '@config/constants';

/**
 * Generic API response interface
 */
export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

/**
 * Success response helper
 */
export const sendSuccess = <T = unknown>(
  res: Response,
  data?: T,
  options: {
    statusCode?: number;
    message?: string;
  } = {}
): Response<ApiResponse<T>> => {
  const { statusCode = HTTP_STATUS.OK, message } = options;

  return res.status(statusCode).json({
    success: true,
    ...(message && { message }),
    ...(data && { data }),
  });
};

/**
 * Success response with pagination
 */
export const sendSuccessWithPagination = <T = unknown>(
  res: Response,
  data: T[],
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  },
  options: {
    statusCode?: number;
    message?: string;
  } = {}
): Response<ApiResponse<T[]>> => {
  const { statusCode = HTTP_STATUS.OK, message } = options;

  return res.status(statusCode).json({
    success: true,
    ...(message && { message }),
    data,
    pagination,
  });
};

/**
 * Created response (201)
 */
export const sendCreated = <T = unknown>(
  res: Response,
  data?: T,
  message: string = 'Resource created successfully'
): Response<ApiResponse<T>> => {
  return sendSuccess(res, data, {
    statusCode: HTTP_STATUS.CREATED,
    message,
  });
};

/**
 * Error response helper
 */
export const sendError = (
  res: Response,
  statusCode: number,
  error: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  }
): Response<ApiResponse> => {
  return res.status(statusCode).json({
    success: false,
    error,
  });
};

/**
 * No content response (204)
 * Used for delete operations that return no data
 */
export const sendNoContent = (res: Response): Response => {
  return res.status(HTTP_STATUS.OK).json({
    success: true,
    message: 'Operation completed successfully',
  });
};

/**
 * Bad request error (400)
 */
export const sendBadRequest = (
  res: Response,
  message: string,
  details?: Record<string, unknown>
): Response<ApiResponse> => {
  return sendError(res, HTTP_STATUS.BAD_REQUEST, {
    code: 'BAD_REQUEST',
    message,
    details,
  });
};

/**
 * Unauthorized error (401)
 */
export const sendUnauthorized = (
  res: Response,
  message: string = 'Unauthorized'
): Response<ApiResponse> => {
  return sendError(res, HTTP_STATUS.UNAUTHORIZED, {
    code: 'UNAUTHORIZED',
    message,
  });
};

/**
 * Forbidden error (403)
 */
export const sendForbidden = (
  res: Response,
  message: string = 'Access denied'
): Response<ApiResponse> => {
  return sendError(res, HTTP_STATUS.FORBIDDEN, {
    code: 'FORBIDDEN',
    message,
  });
};

/**
 * Not found error (404)
 */
export const sendNotFound = (res: Response, resource: string): Response<ApiResponse> => {
  return sendError(res, HTTP_STATUS.NOT_FOUND, {
    code: 'NOT_FOUND',
    message: `${resource} not found`,
  });
};

/**
 * Conflict error (409)
 */
export const sendConflict = (res: Response, message: string): Response<ApiResponse> => {
  return sendError(res, HTTP_STATUS.CONFLICT, {
    code: 'CONFLICT',
    message,
  });
};

/**
 * Internal server error (500)
 */
export const sendInternalError = (
  res: Response,
  message: string = 'Internal server error'
): Response<ApiResponse> => {
  return sendError(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, {
    code: 'INTERNAL_ERROR',
    message,
  });
};

export default {
  sendSuccess,
  sendSuccessWithPagination,
  sendCreated,
  sendError,
  sendNoContent,
  sendBadRequest,
  sendUnauthorized,
  sendForbidden,
  sendNotFound,
  sendConflict,
  sendInternalError,
};
