import { prisma } from '@/lib/prisma';
import type { Prisma, Singleton } from '@prisma/client';

export class SingletonRepository {
  findByKey(key: string): Promise<Singleton | null> {
    return prisma.singleton.findUnique({ where: { key } });
  }

  findAll(): Promise<Singleton[]> {
    return prisma.singleton.findMany();
  }

  upsert(key: string, data: Prisma.InputJsonValue): Promise<Singleton> {
    return prisma.singleton.upsert({
      where: { key },
      update: { data },
      create: { key, data },
    });
  }
}
