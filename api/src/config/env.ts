import 'dotenv/config';
import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(4000),
  LOG_LEVEL: z.string().default('info'),

  DATABASE_URL: z.string().url(),

  ADMIN_JWT_SECRET: z.string().min(32),

  S3_ENDPOINT: z.string().url(),
  S3_REGION: z.string().min(1),
  S3_BUCKET: z.string().min(1),
  S3_ACCESS_KEY_ID: z.string().min(1),
  S3_SECRET_ACCESS_KEY: z.string().min(1),
  S3_PUBLIC_URL: z.string().url(),

  // Comma-separated list of allowed CORS origins, e.g.
  // "https://www.ceylonaromavitae.lk,https://ceylonaromavitae.lk"
  FRONTEND_URL: z.string().refine(
    (val) =>
      val
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)
        .every((u) => {
          try {
            new URL(u);
            return true;
          } catch {
            return false;
          }
        }),
    { message: 'FRONTEND_URL must be a comma-separated list of valid URLs' }
  ),

  GITHUB_REPO: z.string().optional(),
  GITHUB_PAT: z.string().optional(),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('Invalid environment variables:', parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsed.data;
export type Env = typeof env;
