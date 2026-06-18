import { z } from 'zod';
import { objectIdSchema } from '@utils/validators';

export const notificationTypeSchema = z.enum([
  'COMPLAINT_CREATED',
  'COMPLAINT_ASSIGNED',
  'COMPLAINT_RESOLVED',
  'COMPLAINT_CLOSED',
  'FACILITY_BOOKING_CREATED',
  'FACILITY_BOOKING_APPROVED',
  'NOTICE_PUBLISHED',
]);

export const notificationEntityTypeSchema = z.enum(['Complaint', 'FacilityBooking', 'Notice']);

export const createNotificationSchema = z.object({
  userId: objectIdSchema,
  societyId: objectIdSchema,
  title: z.string().min(1, 'Title is required').max(255, 'Title is too long').trim(),
  message: z.string().min(1, 'Message is required').max(2000, 'Message is too long').trim(),
  type: notificationTypeSchema,
  entityType: notificationEntityTypeSchema,
  entityId: objectIdSchema,
});

export const listNotificationsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  isRead: z
    .union([z.literal('true'), z.literal('false')])
    .transform((value) => value === 'true')
    .optional(),
});

export const idParamSchema = z.object({
  id: objectIdSchema,
});

export type CreateNotificationInput = z.infer<typeof createNotificationSchema>;
export type ListNotificationsQueryInput = z.infer<typeof listNotificationsQuerySchema>;
export type NotificationIdParam = z.infer<typeof idParamSchema>;
