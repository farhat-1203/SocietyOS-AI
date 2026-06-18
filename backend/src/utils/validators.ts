import { z } from 'zod';

/**
 * Common/reusable Zod schemas for validation
 */

// MongoDB ObjectId validation
export const objectIdSchema = z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid MongoDB ID format');

// Email validation
export const emailSchema = z.string().email('Invalid email format').toLowerCase().trim();

// Password validation
export const passwordSchema = z
  .string()
  .min(6, 'Password must be at least 6 characters')
  .max(128, 'Password must be at most 128 characters');

// Name/string validation
export const nameSchema = z
  .string()
  .trim()
  .min(2, 'Name must be at least 2 characters')
  .max(255, 'Name must be at most 255 characters');

// Pagination schema
export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1, 'Page must be at least 1').default(1),
  limit: z.coerce
    .number()
    .int()
    .min(1, 'Limit must be at least 1')
    .max(100, 'Limit must be at most 100')
    .default(20),
});

// ID parameter schema
export const idParamSchema = z.object({
  id: objectIdSchema,
});

// Timestamp schema
export const timestampSchema = z.object({
  createdAt: z.date(),
  updatedAt: z.date(),
});

/**
 * Parse and validate data with Zod schema
 * Throws ValidationError if validation fails
 */
export const validateData = <T>(schema: z.ZodSchema<T>, data: unknown): T => {
  const result = schema.safeParse(data);

  if (!result.success) {
    const errors = result.error.errors.map((err) => ({
      field: err.path.join('.'),
      message: err.message,
    }));

    const message = errors.map((e) => `${e.field}: ${e.message}`).join('; ');
    throw new Error(message);
  }

  return result.data;
};

/**
 * Safe parse - returns result object
 */
export const safeParse = <T>(
  schema: z.ZodSchema<T>,
  data: unknown
): z.SafeParseReturnType<T, T> => {
  return schema.safeParse(data);
};

export default {
  objectIdSchema,
  emailSchema,
  passwordSchema,
  nameSchema,
  paginationSchema,
  idParamSchema,
  timestampSchema,
  validateData,
  safeParse,
};
