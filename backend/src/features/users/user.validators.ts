import { z } from 'zod';
import { emailSchema, passwordSchema, nameSchema } from '@utils/validators';

export const createUserSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  name: nameSchema,
  societyId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid societyId format'),
  roles: z.array(z.string().regex(/^[0-9a-fA-F]{24}$/)).optional(),
  status: z.enum(['active', 'inactive', 'suspended']).default('active'),
});

export const updateUserSchema = z.object({
  name: nameSchema.optional(),
  status: z.enum(['active', 'inactive', 'suspended']).optional(),
  roles: z.array(z.string().regex(/^[0-9a-fA-F]{24}$/)).optional(),
});

export const updatePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: passwordSchema,
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type UpdatePasswordInput = z.infer<typeof updatePasswordSchema>;
