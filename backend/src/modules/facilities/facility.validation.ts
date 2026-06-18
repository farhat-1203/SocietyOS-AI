import { z } from 'zod';
import { objectIdSchema } from '@utils/validators';

const timeSchema = z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Invalid time format');
const dateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format');

export const createFacilitySchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(100, 'Name is too long'),
  description: z.string().trim().max(1000, 'Description is too long').optional(),
  location: z.string().trim().min(1, 'Location is required').max(200, 'Location is too long'),
  capacity: z.number().int().min(1, 'Capacity must be at least 1'),
  bookingDurationMinutes: z.number().int().min(15, 'Booking duration must be at least 15 minutes'),
  operatingHours: z.object({
    start: timeSchema,
    end: timeSchema,
  }).refine((value) => value.start < value.end, {
    message: 'Operating hours start must be before end',
  }),
  isActive: z.boolean().optional(),
});

export const updateFacilitySchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(100, 'Name is too long').optional(),
  description: z.string().trim().max(1000, 'Description is too long').optional(),
  location: z.string().trim().min(1, 'Location is required').max(200, 'Location is too long').optional(),
  capacity: z.number().int().min(1, 'Capacity must be at least 1').optional(),
  bookingDurationMinutes: z.number().int().min(15, 'Booking duration must be at least 15 minutes').optional(),
  operatingHours: z
    .object({
      start: timeSchema,
      end: timeSchema,
    })
    .refine((value) => value.start < value.end, {
      message: 'Operating hours start must be before end',
    })
    .optional(),
  isActive: z.boolean().optional(),
});

export const createBookingSchema = z.object({
  facilityId: objectIdSchema,
  bookingDate: dateSchema,
  startTime: timeSchema,
  endTime: timeSchema,
  notes: z.string().trim().max(1000, 'Notes is too long').optional(),
}).refine((value) => value.startTime < value.endTime, {
  message: 'Booking start time must be before end time',
});

export const approveBookingSchema = z.object({
  notes: z.string().trim().max(1000, 'Notes is too long').optional(),
});

export const rejectBookingSchema = z.object({
  notes: z.string().trim().max(1000, 'Notes is too long').optional(),
});

export const cancelBookingSchema = z.object({
  notes: z.string().trim().max(1000, 'Notes is too long').optional(),
});

export const listFacilitiesQuerySchema = z.object({
  onlyActive: z
    .union([z.literal('true'), z.literal('false')])
    .transform((value) => value === 'true')
    .optional(),
});

export const listBookingsQuerySchema = z.object({
  facilityId: objectIdSchema.optional(),
  bookingDate: dateSchema.optional(),
  status: z.enum(['Pending', 'Approved', 'Rejected', 'Cancelled']).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export const idParamSchema = z.object({
  id: objectIdSchema,
});

export type CreateFacilityInput = z.infer<typeof createFacilitySchema>;
export type UpdateFacilityInput = z.infer<typeof updateFacilitySchema>;
export type CreateBookingInput = z.infer<typeof createBookingSchema>;
export type ApproveBookingInput = z.infer<typeof approveBookingSchema>;
export type RejectBookingInput = z.infer<typeof rejectBookingSchema>;
export type CancelBookingInput = z.infer<typeof cancelBookingSchema>;
export type ListFacilitiesQueryInput = z.infer<typeof listFacilitiesQuerySchema>;
export type ListBookingsQueryInput = z.infer<typeof listBookingsQuerySchema>;
export type IdParamInput = z.infer<typeof idParamSchema>;
