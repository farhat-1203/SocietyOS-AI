/**
 * General utility helper functions
 */

/**
 * Safely parse JSON string
 */
export const safeJsonParse = <T = unknown>(data: string, fallback?: T): T | null => {
  try {
    return JSON.parse(data) as T;
  } catch {
    return fallback ?? null;
  }
};

/**
 * Check if value is a valid MongoDB ObjectId
 */
export const isValidObjectId = (id: unknown): boolean => {
  if (typeof id !== 'string') return false;
  return /^[0-9a-fA-F]{24}$/.test(id);
};

/**
 * Extract pagination from query
 */
export const getPaginationFromQuery = (
  query: Record<string, unknown>
): { page: number; limit: number; skip: number } => {
  const page = Math.max(1, Number(query.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(query.limit) || 20));

  return { page, limit, skip: (page - 1) * limit };
};

/**
 * Format pagination response
 */
export const formatPaginationMeta = (
  page: number,
  limit: number,
  total: number
): { page: number; limit: number; total: number; pages: number } => ({
  page,
  limit,
  total,
  pages: Math.ceil(total / limit),
});

/**
 * Sleep for specified milliseconds
 * Useful for testing and retries
 */
export const sleep = (ms: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

/**
 * Retry function with exponential backoff
 */
export const retry = async <T>(
  fn: () => Promise<T>,
  options: {
    maxAttempts?: number;
    delayMs?: number;
    backoffMultiplier?: number;
  } = {}
): Promise<T> => {
  const { maxAttempts = 3, delayMs = 100, backoffMultiplier = 2 } = options;

  let lastError: Error | null = null;
  let delay = delayMs;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      if (attempt < maxAttempts) {
        await sleep(delay);
        delay *= backoffMultiplier;
      }
    }
  }

  throw lastError || new Error('Max retry attempts exceeded');
};

/**
 * Omit properties from object
 */
export const omit = <T extends Record<string, unknown>, K extends keyof T>(
  obj: T,
  keys: K[]
): Omit<T, K> => {
  const result = { ...obj };
  keys.forEach((key) => delete result[key]);
  return result as Omit<T, K>;
};

/**
 * Pick properties from object
 */
export const pick = <T extends Record<string, unknown>, K extends keyof T>(
  obj: T,
  keys: K[]
): Pick<T, K> => {
  const result = {} as Pick<T, K>;
  keys.forEach((key) => {
    result[key] = obj[key];
  });
  return result;
};

/**
 * Merge objects deeply
 */
export const deepMerge = <T extends Record<string, unknown>>(
  target: T,
  ...sources: Partial<T>[]
): T => {
  if (!sources.length) return target;

  const source = sources.shift();

  if (source === undefined) {
    return target;
  }

  for (const key in source) {
    if (Object.prototype.hasOwnProperty.call(source, key)) {
      const sourceValue = source[key];
      const targetValue = target[key];

      if (
        sourceValue &&
        typeof sourceValue === 'object' &&
        !Array.isArray(sourceValue) &&
        targetValue &&
        typeof targetValue === 'object' &&
        !Array.isArray(targetValue)
      ) {
        deepMerge(targetValue as Record<string, unknown>, sourceValue as Record<string, unknown>);
      } else {
        target[key] = sourceValue as any;
      }
    }
  }

  return deepMerge(target, ...sources);
};

/**
 * Generate a random string
 */
export const generateRandomString = (length: number = 32): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

export default {
  safeJsonParse,
  isValidObjectId,
  getPaginationFromQuery,
  formatPaginationMeta,
  sleep,
  retry,
  omit,
  pick,
  deepMerge,
  generateRandomString,
};
