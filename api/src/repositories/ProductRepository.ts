import { prisma } from '@/lib/prisma';
import type { Product } from '@prisma/client';
import type { ProductCreateInput, ProductUpdateInput, ProductWithCategory } from '@/types/product';

const categoryInclude = { category: { select: { id: true, name: true } } } as const;

export class ProductRepository {
  findAll(): Promise<ProductWithCategory[]> {
    return prisma.product.findMany({
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
      include: categoryInclude,
    });
  }

  findById(id: string): Promise<ProductWithCategory | null> {
    return prisma.product.findUnique({ where: { id }, include: categoryInclude });
  }

  create(data: ProductCreateInput): Promise<ProductWithCategory> {
    return prisma.product.create({ data, include: categoryInclude });
  }

  update(id: string, data: ProductUpdateInput): Promise<ProductWithCategory> {
    return prisma.product.update({ where: { id }, data, include: categoryInclude });
  }

  delete(id: string): Promise<Product> {
    return prisma.product.delete({ where: { id } });
  }

  async reorder(ids: string[]): Promise<void> {
    await prisma.$transaction(
      ids.map((id, index) =>
        prisma.product.update({ where: { id }, data: { sortOrder: index } })
      )
    );
  }
}
