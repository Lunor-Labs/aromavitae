import { prisma } from '@/lib/prisma';
import type { Product } from '@prisma/client';
import type { ProductCreateInput, ProductUpdateInput } from '@/types/product';

export class ProductRepository {
  findAll(): Promise<Product[]> {
    return prisma.product.findMany({ orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }] });
  }

  findById(id: string): Promise<Product | null> {
    return prisma.product.findUnique({ where: { id } });
  }

  create(data: ProductCreateInput): Promise<Product> {
    return prisma.product.create({ data });
  }

  update(id: string, data: ProductUpdateInput): Promise<Product> {
    return prisma.product.update({ where: { id }, data });
  }

  delete(id: string): Promise<Product> {
    return prisma.product.delete({ where: { id } });
  }
}
