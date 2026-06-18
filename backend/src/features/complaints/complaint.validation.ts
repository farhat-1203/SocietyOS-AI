import { z } from 'zod';

const objectIdSchema = z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid ObjectId format');

// ─── Create Complaint ─────────────────────────────────────────────────────────

export const createComplaintSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(200, 'Title too long').trim(),
  description: z
    .string()
    .min(10, 'Description must be at least 10 characters')
    .max(2000, 'Description too long')
    .trim(),
  category: z.enum(['Maintenance', 'Plumbing', 'Electrical', 'Security', 'Housekeeping', 'Other']),
  priority: z.enum(['Low', 'Medium', 'High', 'Critical']).default('Medium'),
  attachments: z.array(z.string().url('Attachment must be a valid URL')).max(10).optional(),
});

// ─── Assign Complaint ─────────────────────────────────────────────────────────

export const assignComplaintSchema = z.object({
  assignedTo: objectIdSchema,
});

// ─── Update Status ────────────────────────────────────────────────────────────

export const updateComplaintStatusSchema = z.object({
  status: z.enum(['Open', 'In Progress', 'Resolved', 'Closed']),
});

// ─── Resolve Complaint ────────────────────────────────────────────────────────

export const resolveComplaintSchema = z.object({
  resolutionNotes: z
    .string()
    .min(10, 'Resolution notes must be at least 10 characters')
    .max(2000, 'Resolution notes too long')
    .trim(),
});

// ─── Add Vendor Note ──────────────────────────────────────────────────────────

export const addVendorNoteSchema = z.object({
  resolutionNotes: z.string().min(1, 'Note cannot be empty').max(2000, 'Note too long').trim(),
});

// ─── Query / Filter ───────────────────────────────────────────────────────────

export const complaintQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
  status: z.enum(['Open', 'In Progress', 'Resolved', 'Closed']).optional(),
  priority: z.enum(['Low', 'Medium', 'High', 'Critical']).optional(),
  category: z
    .enum(['Maintenance', 'Plumbing', 'Electrical', 'Security', 'Housekeeping', 'Other'])
    .optional(),
  assignedTo: objectIdSchema.optional(),
  createdBy: objectIdSchema.optional(),
});

// ─── Inferred Types ───────────────────────────────────────────────────────────

export type CreateComplaintInput = z.infer<typeof createComplaintSchema>;
export type AssignComplaintInput = z.infer<typeof assignComplaintSchema>;
export type UpdateComplaintStatusInput = z.infer<typeof updateComplaintStatusSchema>;
export type ResolveComplaintInput = z.infer<typeof resolveComplaintSchema>;
export type AddVendorNoteInput = z.infer<typeof addVendorNoteSchema>;
export type ComplaintQueryInput = z.infer<typeof complaintQuerySchema>;
