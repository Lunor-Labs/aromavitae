import bcrypt from 'bcryptjs';
import { AppError } from '@/lib/AppError';
import { signAdminToken } from '@/lib/auth';
import { logger } from '@/lib/logger';
import { AdminUserRepository } from '@/repositories/AdminUserRepository';
import type { LoginInput } from '@/types/auth';

export class AuthService {
  constructor(private repo = new AdminUserRepository()) {}

  async login(input: LoginInput): Promise<{ token: string; email: string }> {
    const email = input.email.toLowerCase();
    const admin = await this.repo.findByEmail(email);
    if (!admin) {
      logger.warn({ email }, 'Login attempt for unknown admin email');
      throw new AppError('Invalid email or password', 401, 'UNAUTHORIZED');
    }

    const valid = await bcrypt.compare(input.password, admin.passwordHash);
    if (!valid) {
      logger.warn({ email }, 'Login attempt with incorrect password');
      throw new AppError('Invalid email or password', 401, 'UNAUTHORIZED');
    }

    const token = signAdminToken({ sub: admin.id, email: admin.email });
    logger.info({ email }, 'Admin logged in');
    return { token, email: admin.email };
  }
}
