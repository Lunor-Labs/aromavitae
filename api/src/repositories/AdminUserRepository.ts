import { prisma } from '@/lib/prisma';
import type { AdminUser } from '@prisma/client';

export class AdminUserRepository {
  findByEmail(email: string): Promise<AdminUser | null> {
    return prisma.adminUser.findUnique({ where: { email } });
  }
}
