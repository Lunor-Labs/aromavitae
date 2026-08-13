import { z } from 'zod';
import type { Prisma } from '@prisma/client';

export const productCreateSchema = z.object({
  name: z.string().min(1).max(200),
  price: z.number().int().nonnegative(),
  currency: z.string().min(1).max(8).default('LKR'),
  rating: z.number().min(0).max(5),
  reviewCount: z.number().int().nonnegative(),
  image: z.string().min(1).max(2048),
  sideImages: z.array(z.string().min(1).max(2048)).max(10).default([]),
  description: z.string().max(5000).nullable().optional(),
  tags: z.array(z.string().min(1).max(64)).max(10).default([]),
  isBestSeller: z.boolean().default(false),
  categoryId: z.string().min(1).nullable().optional(),
  sortOrder: z.number().int().default(0),
});

export const productUpdateSchema = productCreateSchema.partial();

export const idParamsSchema = z.object({ id: z.string().min(1) });

export type ProductCreateInput = z.infer<typeof productCreateSchema>;
export type ProductUpdateInput = z.infer<typeof productUpdateSchema>;

// Product rows are always served with their category name attached
export type ProductWithCategory = Prisma.ProductGetPayload<{
  include: { category: { select: { id: true; name: true } } };
}>;
