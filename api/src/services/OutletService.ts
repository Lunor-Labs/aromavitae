import { AppError } from '@/lib/AppError';
import { logger } from '@/lib/logger';
import { revalidateFrontend } from '@/lib/revalidate';
import { OutletRepository } from '@/repositories/OutletRepository';
import type { Outlet } from '@prisma/client';
import type { OutletCreateInput, OutletUpdateInput } from '@/types/outlet';

export class OutletService {
  constructor(private repo = new OutletRepository()) {}

  async getAll(): Promise<Outlet[]> {
    return this.repo.findAll();
  }

  async getById(id: string): Promise<Outlet> {
    const o = await this.repo.findById(id);
    if (!o) throw new AppError('Outlet not found', 404, 'NOT_FOUND');
    return o;
  }

  async create(input: OutletCreateInput): Promise<Outlet> {
    const o = await this.repo.create(input);
    logger.info({ id: o.id }, 'Outlet created');
    await revalidateFrontend();
    return o;
  }

  async update(id: string, input: OutletUpdateInput): Promise<Outlet> {
    await this.getById(id);
    const o = await this.repo.update(id, input);
    logger.info({ id: o.id }, 'Outlet updated');
    await revalidateFrontend();
    return o;
  }

  async delete(id: string): Promise<void> {
    await this.getById(id);
    await this.repo.delete(id);
    logger.info({ id }, 'Outlet deleted');
    await revalidateFrontend();
  }
}
