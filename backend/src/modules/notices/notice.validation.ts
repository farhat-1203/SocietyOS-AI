import { z } from 'zod';

const attachmentsSchema = z.array(z.string().url('Invalid attachment URL')).optional();

export const createNoticeSchema = z.object({
  title: z.string().trim().min(1, 'Title is required').max(200, 'Title is too long'),
  content: z.string().trim().min(1, 'Content is required').max(5000, 'Content is too long'),
  attachments: attachmentsSchema,
});

export const updateNoticeSchema = z.object({
  title: z.string().trim().min(1, 'Title is required').max(200, 'Title is too long').optional(),
  content: z.string().trim().min(1, 'Content is required').max(5000, 'Content is too long').optional(),
  attachments: attachmentsSchema.optional(),
});

export const publishNoticeSchema = z.object({
  attachments: attachmentsSchema.optional(),
});

export const archiveNoticeSchema = z.object({
  notes: z.string().trim().max(1000, 'Notes are too long').optional(),
});

export const listNoticesQuerySchema = z.object({
  status: z.enum(['Draft', 'Published', 'Archived']).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export const idParamSchema = z.object({
  id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid id format'),
});

export type CreateNoticeInput = z.infer<typeof createNoticeSchema>;
export type UpdateNoticeInput = z.infer<typeof updateNoticeSchema>;
export type PublishNoticeInput = z.infer<typeof publishNoticeSchema>;
export type ArchiveNoticeInput = z.infer<typeof archiveNoticeSchema>;
export type ListNoticesQueryInput = z.infer<typeof listNoticesQuerySchema>;
export type IdParamInput = z.infer<typeof idParamSchema>;
