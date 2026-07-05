import { prisma } from '@/lib/prisma';
import type { Outlet } from '@prisma/client';
import type { OutletCreateInput, OutletUpdateInput } from '@/types/outlet';

export class OutletRepository {
  findAll(): Promise<Outlet[]> {
    return prisma.outlet.findMany({ orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }] });
  }

  findById(id: string): Promise<Outlet | null> {
    return prisma.outlet.findUnique({ where: { id } });
  }

  create(data: OutletCreateInput): Promise<Outlet> {
    return prisma.outlet.create({ data });
  }

  update(id: string, data: OutletUpdateInput): Promise<Outlet> {
    return prisma.outlet.update({ where: { id }, data });
  }

  delete(id: string): Promise<Outlet> {
    return prisma.outlet.delete({ where: { id } });
  }
}
