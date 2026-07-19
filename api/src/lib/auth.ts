import jwt from 'jsonwebtoken';
import { env } from '@/config/env';

export interface AdminTokenPayload {
  sub: string;
  email: string;
}

const EXPIRES_IN = '7d';

export function signAdminToken(payload: AdminTokenPayload): string {
  return jwt.sign(payload, env.ADMIN_JWT_SECRET, { expiresIn: EXPIRES_IN });
}

export function verifyAdminToken(token: string): AdminTokenPayload {
  const decoded = jwt.verify(token, env.ADMIN_JWT_SECRET);
  return decoded as AdminTokenPayload;
}
