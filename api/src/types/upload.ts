import { z } from 'zod';

const SAFE_EXT = /\.(jpe?g|png|webp|gif|svg|avif)$/i;

export const uploadRequestSchema = z.object({
  filename: z
    .string()
    .min(1)
    .max(200)
    .refine((f) => SAFE_EXT.test(f), { message: 'Unsupported file extension' }),
  contentType: z
    .string()
    .min(1)
    .refine((c) => c.startsWith('image/'), { message: 'Content type must be image/*' }),
});

export type UploadRequest = z.infer<typeof uploadRequestSchema>;
