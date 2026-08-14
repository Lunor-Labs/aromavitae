import { z } from 'zod';
import type { Prisma } from '@prisma/client';

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const blogPostCreateSchema = z.object({
  title: z.string().min(1).max(200),
  slug: z.string().min(1).max(200).regex(slugPattern, 'Use lowercase letters, numbers, and hyphens only'),
  excerpt: z.string().min(1).max(500),
  content: z.string().min(1).max(50000),
  coverImage: z.string().min(1).max(2048),
  categoryId: z.string().min(1).nullable().optional(),
  isFeatured: z.boolean().default(false),
  publishedAt: z.coerce.date().default(() => new Date()),
  sortOrder: z.number().int().default(0),
});

export const blogPostUpdateSchema = blogPostCreateSchema.partial();

export const idParamsSchema = z.object({ id: z.string().min(1) });

export type BlogPostCreateInput = z.infer<typeof blogPostCreateSchema>;
export type BlogPostUpdateInput = z.infer<typeof blogPostUpdateSchema>;

// Blog post rows are always served with their category name attached
export type BlogPostWithCategory = Prisma.BlogPostGetPayload<{
  include: { category: { select: { id: true; name: true } } };
}>;
