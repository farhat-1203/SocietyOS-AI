import { z } from 'zod';
import { objectIdSchema, paginationSchema } from '@utils/validators';

export const vendorTypeSchema = z.enum([
  'Electrician',
  'Plumber',
  'Housekeeping',
  'Security',
  'Carpenter',
  'Painter',
  'Appliance Repair',
  'Pest Control',
  'Other',
]);

export const createVendorSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(255).trim(),
  businessName: z.string().min(2, 'Business name must be at least 2 characters').max(255).trim(),
  vendorType: vendorTypeSchema,
  phone: z.string().min(7, 'Phone number is required').max(20).trim(),
  email: z.string().email('Invalid email address').trim().toLowerCase(),
  address: z.string().min(5, 'Address must be at least 5 characters').max(1000).trim(),
  description: z.string().min(10, 'Description must be at least 10 characters').max(2000).trim(),
  services: z.array(z.string().min(1).trim()).min(1, 'At least one service is required'),
  isActive: z.boolean().optional(),
});

export const updateVendorSchema = z.object({
  name: z.string().min(2).max(255).trim().optional(),
  businessName: z.string().min(2).max(255).trim().optional(),
  vendorType: vendorTypeSchema.optional(),
  phone: z.string().min(7).max(20).trim().optional(),
  email: z.string().email('Invalid email address').trim().toLowerCase().optional(),
  address: z.string().min(5).max(1000).trim().optional(),
  description: z.string().min(10).max(2000).trim().optional(),
  services: z.array(z.string().min(1).trim()).min(1).optional(),
  isActive: z.boolean().optional(),
});

export const createReviewSchema = z.object({
  rating: z.number().int().min(1, 'Rating must be at least 1').max(5, 'Rating must be at most 5'),
  comment: z.string().min(5, 'Comment must be at least 5 characters').max(1000).trim(),
});

export const listVendorsQuerySchema = z.object({
  page: paginationSchema.shape.page.optional(),
  limit: paginationSchema.shape.limit.optional(),
  search: z.string().trim().min(1).optional(),
  vendorType: vendorTypeSchema.optional(),
  services: z.string().trim().optional(),
  isActive: z.preprocess(
    (value) => {
      if (value === 'true') return true;
      if (value === 'false') return false;
      return value;
    },
    z.boolean()
  ).optional(),
  societyId: objectIdSchema.optional(),
});
