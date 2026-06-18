import { z } from 'zod';

const objectIdSchema = z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid ObjectId format');

// ─── Notification Types ───────────────────────────────────────────────────────

const notificationTypeEnum = z.enum([
  'COMPLAINT_CREATED',
  'COMPLAINT_ASSIGNED',
  'COMPLAINT_RESOLVED',
  'COMPLAINT_CLOSED',
  'FACILITY_BOOKING_CREATED',
  'FACILITY_BOOKING_APPROVED',
  'NOTICE_PUBLISHED',
]);

const entityTypeEnum = z.enum(['Complaint', 'FacilityBooking', 'Notice']);

// ─── Create Notification ──────────────────────────────────────────────────────

export const createNotificationSchema = z.object({
  userId: objectIdSchema,
  societyId: objectIdSchema,
  title: z.string().min(1, 'Title is required').max(200, 'Title too long').trim(),
  message: z.string().min(1, 'Message is required').max(2000, 'Message too long').trim(),
  type: notificationTypeEnum,
  entityType: entityTypeEnum,
  entityId: objectIdSchema,
});

// ─── List Notifications Query ─────────────────────────────────────────────────

export const listNotificationsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  isRead: z
    .string()
    .transform((val) => {
      if (val === 'true') return true;
      if (val === 'false') return false;
      return undefined;
    })
    .optional(),
});

// ─── Inferred Types ───────────────────────────────────────────────────────────

export type CreateNotificationInput = z.infer<typeof createNotificationSchema>;
export type ListNotificationsQueryInput = z.infer<typeof listNotificationsQuerySchema>;
