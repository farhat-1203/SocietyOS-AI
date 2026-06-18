/**
 * Common API types and interfaces
 */

/**
 * Standard API error response
 */
export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
}

/**
 * Standard API success response
 */
export interface ApiSuccessResponse<T = unknown> {
  success: true;
  message?: string;
  data?: T;
  pagination?: PaginationMeta;
}

/**
 * Pagination metadata
 */
export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

/**
 * Query options for database operations
 */
export interface QueryOptions {
  skip?: number;
  limit?: number;
  sort?: Record<string, 1 | -1>;
  lean?: boolean;
}

/**
 * Filter options for list operations
 */
export interface FilterOptions {
  search?: string;
  status?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

/**
 * Audit trail for data changes
 */
export interface AuditTrail {
  createdAt: Date;
  createdBy?: string;
  updatedAt: Date;
  updatedBy?: string;
  deletedAt?: Date | null;
}

/**
 * Timestamp fields
 */
export interface Timestamps {
  createdAt: Date;
  updatedAt: Date;
}
