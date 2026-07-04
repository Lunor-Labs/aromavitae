import { AppError } from '@/lib/AppError';
import { logger } from '@/lib/logger';
import { revalidateFrontend } from '@/lib/revalidate';
import { SingletonRepository } from '@/repositories/SingletonRepository';
import {
  isSingletonKey,
  singletonSchemas,
  type SingletonKey,
} from '@/types/singleton';
import type { Singleton } from '@prisma/client';
import type { Prisma } from '@prisma/client';

export class SingletonService {
  constructor(private repo = new SingletonRepository()) {}

  assertKey(key: string): asserts key is SingletonKey {
    if (!isSingletonKey(key)) {
      throw new AppError(`Unknown singleton key: ${key}`, 404, 'NOT_FOUND');
    }
  }

  async getByKey(key: string): Promise<Singleton> {
    this.assertKey(key);
    const row = await this.repo.findByKey(key);
    if (!row) throw new AppError('Singleton not found', 404, 'NOT_FOUND');
    return row;
  }

  async getAllMap(): Promise<Record<string, unknown>> {
    const rows = await this.repo.findAll();
    return Object.fromEntries(rows.map((r) => [r.key, r.data]));
  }

  async upsert(key: string, body: unknown): Promise<Singleton> {
    this.assertKey(key);
    const schema = singletonSchemas[key];
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      throw new AppError('Invalid singleton payload', 400, 'VALIDATION_ERROR');
    }
    const row = await this.repo.upsert(key, parsed.data as Prisma.InputJsonValue);
    logger.info({ key }, 'Singleton updated');
    await revalidateFrontend();
    return row;
  }
}
