import cors from 'cors';
import express from 'express';
import { rateLimit } from 'express-rate-limit';
import helmet from 'helmet';
import pinoHttp from 'pino-http';

import { env } from '@/config/env';
import { logger } from '@/lib/logger';
import { errorHandler } from '@/middleware/errorHandler';

import { contentRouter } from '@/routes/content';
import { productsRouter } from '@/routes/products';
import { categoriesRouter } from '@/routes/categories';
import { testimonialsRouter } from '@/routes/testimonials';
import { singletonsRouter } from '@/routes/singletons';
import { uploadsRouter } from '@/routes/uploads';

export const app = express();

app.disable('x-powered-by');
// Render terminates TLS at its proxy; needed for express-rate-limit to read the real client IP
app.set('trust proxy', 1);
app.use(helmet());

const allowedOrigins = [env.FRONTEND_URL, 'http://localhost:3000'];
const vercelPreviewPattern = /^https:\/\/[a-z0-9-]+\.vercel\.app$/;

app.use(
  cors({
    origin(origin, callback) {
      const allowed =
        !origin || allowedOrigins.includes(origin) || vercelPreviewPattern.test(origin);
      callback(null, allowed);
    },
    credentials: true,
  })
);
app.use(express.json({ limit: '1mb' }));
app.use(pinoHttp({ logger }));
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 300,
    standardHeaders: true,
    legacyHeaders: false,
  })
);

app.get('/health', (_req, res) => {
  res.json({ data: { status: 'ok', timestamp: new Date().toISOString() } });
});

app.use('/api/v1/content', contentRouter);
app.use('/api/v1/products', productsRouter);
app.use('/api/v1/categories', categoriesRouter);
app.use('/api/v1/testimonials', testimonialsRouter);
app.use('/api/v1/singletons', singletonsRouter);
app.use('/api/v1/uploads', uploadsRouter);

app.use((_req, res) => {
  res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Route not found' } });
});

app.use(errorHandler);
