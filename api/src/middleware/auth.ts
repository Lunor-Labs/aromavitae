import type { NextFunction, Request, Response } from 'express';
import { AppError } from '@/lib/AppError';
import { verifyAdminToken } from '@/lib/auth';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      adminUser?: { id: string; email: string };
    }
  }
}

export function requireAdmin(req: Request, _res: Response, next: NextFunction) {
  try {
    const header = req.headers.authorization;
    if (!header?.startsWith('Bearer ')) {
      throw new AppError('Missing bearer token', 401, 'UNAUTHORIZED');
    }
    const token = header.slice('Bearer '.length).trim();
    if (!token) throw new AppError('Missing bearer token', 401, 'UNAUTHORIZED');

    const payload = verifyAdminToken(token);
    req.adminUser = { id: payload.sub, email: payload.email };
    next();
  } catch {
    next(new AppError('Invalid or expired token', 401, 'UNAUTHORIZED'));
  }
}
