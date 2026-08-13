import { z } from 'zod';

export const blogCategoryCreateSchema = z.object({
  name: z.string().min(1).max(100),
  sortOrder: z.number().int().default(0),
});

export const blogCategoryUpdateSchema = blogCategoryCreateSchema.partial();

export type BlogCategoryCreateInput = z.infer<typeof blogCategoryCreateSchema>;
export type BlogCategoryUpdateInput = z.infer<typeof blogCategoryUpdateSchema>;
