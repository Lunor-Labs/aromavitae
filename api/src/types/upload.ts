import { z } from 'zod';

/**
 * SVG is deliberately absent. Every uploaded image is rendered through the
 * Next image optimizer, which refuses SVG unless `dangerouslyAllowSVG` is on —
 * so accepting one here would mint a URL that 400s wherever it is displayed.
 * Rejecting it at upload keeps the two ends consistent; re-add it here only
 * alongside `dangerouslyAllowSVG` (plus a CSP) in `next.config.ts`.
 */
const SAFE_EXT = /\.(jpe?g|png|webp|gif|avif)$/i;

export const uploadRequestSchema = z.object({
  filename: z
    .string()
    .min(1)
    .max(200)
    .refine((f) => SAFE_EXT.test(f), { message: 'Unsupported file extension' }),
  contentType: z
    .string()
    .min(1)
    .refine((c) => c.startsWith('image/') && c !== 'image/svg+xml', {
      message: 'Content type must be a raster image/* type',
    }),
});

export type UploadRequest = z.infer<typeof uploadRequestSchema>;
