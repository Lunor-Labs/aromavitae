import { z } from 'zod';

export const categoryCreateSchema = z.object({
  name: z.string().min(1).max(200),
  image: z.string().min(1).max(2048),
  // Kept for DB compatibility; the UI links categories to /products?category=<id> instead
  href: z.string().min(1).max(2048).default('/products'),
  sortOrder: z.number().int().default(0),
});

export const categoryUpdateSchema = categoryCreateSchema.partial();

export type CategoryCreateInput = z.infer<typeof categoryCreateSchema>;
export type CategoryUpdateInput = z.infer<typeof categoryUpdateSchema>;
