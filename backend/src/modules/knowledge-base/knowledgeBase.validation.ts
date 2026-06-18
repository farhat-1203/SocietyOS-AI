import { z } from 'zod';

export const createKnowledgeBaseArticleSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters long'),
  content: z.string().min(20, 'Content must be at least 20 characters long'),
  summary: z.string().min(10, 'Summary must be at least 10 characters long').max(1000, 'Summary cannot exceed 1000 characters'),
  category: z.string().min(3, 'Category must be at least 3 characters long'),
  tags: z.array(z.string().min(1)).optional(),
  status: z.enum(['Draft', 'Published', 'Archived']).optional(),
});

export const updateKnowledgeBaseArticleSchema = z.object({
  title: z.string().min(5).optional(),
  content: z.string().min(20).optional(),
  summary: z.string().min(10).max(1000).optional(),
  category: z.string().min(3).optional(),
  tags: z.array(z.string().min(1)).optional(),
  status: z.enum(['Draft', 'Published', 'Archived']).optional(),
});

export const listKnowledgeBaseArticlesSchema = z.object({
  page: z.preprocess((value) => Number(value), z.number().int().positive()).optional(),
  limit: z.preprocess((value) => Number(value), z.number().int().positive()).optional(),
  category: z.string().optional(),
  tags: z.string().optional(),
  search: z.string().optional(),
  status: z.enum(['Draft', 'Published', 'Archived']).optional(),
});
