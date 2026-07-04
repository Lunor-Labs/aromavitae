import { prisma } from '@/lib/prisma';
import type { Category } from '@prisma/client';
import type { CategoryCreateInput, CategoryUpdateInput } from '@/types/category';

export class CategoryRepository {
  findAll(): Promise<Category[]> {
    return prisma.category.findMany({ orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }] });
  }

  findById(id: string): Promise<Category | null> {
    return prisma.category.findUnique({ where: { id } });
  }

  create(data: CategoryCreateInput): Promise<Category> {
    return prisma.category.create({ data });
  }

  update(id: string, data: CategoryUpdateInput): Promise<Category> {
    return prisma.category.update({ where: { id }, data });
  }

  delete(id: string): Promise<Category> {
    return prisma.category.delete({ where: { id } });
  }
}
