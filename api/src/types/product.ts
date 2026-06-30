import { z } from 'zod';

export const productCreateSchema = z.object({
  name: z.string().min(1).max(200),
  price: z.number().int().nonnegative(),
  currency: z.string().min(1).max(8).default('LKR'),
  rating: z.number().min(0).max(5),
  reviewCount: z.number().int().nonnegative(),
  image: z.string().min(1).max(2048),
  badge: z.string().max(64).nullable().optional(),
  category: z.string().min(1).max(64),
  sortOrder: z.number().int().default(0),
});

export const productUpdateSchema = productCreateSchema.partial();

export const idParamsSchema = z.object({ id: z.string().min(1) });

export type ProductCreateInput = z.infer<typeof productCreateSchema>;
export type ProductUpdateInput = z.infer<typeof productUpdateSchema>;
