import { z } from 'zod';

export const outletCreateSchema = z.object({
  name: z.string().min(1).max(200),
  address: z.string().min(1).max(500),
  phone: z.string().min(1).max(50),
  description: z.string().min(1).max(2000),
  image: z.string().min(1).max(2048),
  sortOrder: z.number().int().default(0),
});

export const outletUpdateSchema = outletCreateSchema.partial();

export type OutletCreateInput = z.infer<typeof outletCreateSchema>;
export type OutletUpdateInput = z.infer<typeof outletUpdateSchema>;
