import { z } from 'zod';

export const galleryImageCreateSchema = z.object({
  image: z.string().min(1).max(2048),
  alt: z.string().max(300).default(''),
  tags: z.array(z.string().min(1).max(64)).min(1).max(10),
  span: z.enum(['tall', 'wide']).nullable().optional(),
  sortOrder: z.number().int().default(0),
});

export const galleryImageUpdateSchema = galleryImageCreateSchema.partial();

export type GalleryImageCreateInput = z.infer<typeof galleryImageCreateSchema>;
export type GalleryImageUpdateInput = z.infer<typeof galleryImageUpdateSchema>;
