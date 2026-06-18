import { z } from 'zod';

export const dashboardQuerySchema = z.object({
  societyId: z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/, 'Invalid societyId format')
    .optional(),
});

export type DashboardQueryInput = z.infer<typeof dashboardQuerySchema>;
