import type { Request } from 'express';

/**
 * Extended Express Request with application-specific properties
 */
export interface AuthenticatedRequest<
  P = Record<string, any>,
  ResBody = any,
  ReqBody = any,
  ReqQuery = any,
> extends Request<P, ResBody, ReqBody, ReqQuery> {
  /**
   * User information extracted from JWT token
   */
  user?: {
    userId: string;
    societyId: string;
    roles: string[];
    permissions: string[];
    iat: number;
    exp: number;
  };

  /**
   * Tenancy context (societyId + userId)
   */
  tenancy?: {
    societyId: string;
    userId: string;
  };

  /**
   * Request ID for tracing and logging
   */
  requestId?: string;

  /**
   * Timestamp when request was received
   */
  startTime?: number;
}

/**
 * Pagination query parameters
 */
export interface PaginationQuery {
  page?: string | number;
  limit?: string | number;
  sort?: string;
  order?: 'asc' | 'desc';
}

/**
 * List response with pagination
 */
export interface ListResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}
