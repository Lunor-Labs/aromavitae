import type { NextFunction, Request, Response } from 'express';
import { env } from '@/config/env';
import { AppError } from '@/lib/AppError';
import { logger } from '@/lib/logger';
import { supabaseAdmin } from '@/lib/supabase';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      adminUser?: { id: string; email: string };
    }
  }
}

export async function requireAdmin(req: Request, _res: Response, next: NextFunction) {
  try {
    const header = req.headers.authorization;
    if (!header?.startsWith('Bearer ')) {
      throw new AppError('Missing bearer token', 401, 'UNAUTHORIZED');
    }
    const token = header.slice('Bearer '.length).trim();
    if (!token) throw new AppError('Missing bearer token', 401, 'UNAUTHORIZED');

    const { data, error } = await supabaseAdmin.auth.getUser(token);
    if (error || !data.user) {
      throw new AppError('Invalid token', 401, 'UNAUTHORIZED');
    }

    const email = data.user.email?.toLowerCase();
    if (!email || !env.ADMIN_EMAILS.includes(email)) {
      logger.warn({ email }, 'Non-admin attempted privileged action');
      throw new AppError('Forbidden', 403, 'FORBIDDEN');
    }

    req.adminUser = { id: data.user.id, email };
    next();
  } catch (err) {
    next(err);
  }
}
