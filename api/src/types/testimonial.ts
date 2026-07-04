import { z } from 'zod';

export const testimonialCreateSchema = z.object({
  quote: z.string().min(1).max(2000),
  author: z.string().min(1).max(120),
  location: z.string().min(1).max(120),
  rating: z.number().int().min(1).max(5),
  sortOrder: z.number().int().default(0),
});

export const testimonialUpdateSchema = testimonialCreateSchema.partial();

export type TestimonialCreateInput = z.infer<typeof testimonialCreateSchema>;
export type TestimonialUpdateInput = z.infer<typeof testimonialUpdateSchema>;
