import { prisma } from '@/lib/prisma';
import type { BlogCategory } from '@prisma/client';
import type { BlogCategoryCreateInput, BlogCategoryUpdateInput } from '@/types/blogCategory';

export class BlogCategoryRepository {
  findAll(): Promise<BlogCategory[]> {
    return prisma.blogCategory.findMany({ orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }] });
  }

  findById(id: string): Promise<BlogCategory | null> {
    return prisma.blogCategory.findUnique({ where: { id } });
  }

  create(data: BlogCategoryCreateInput): Promise<BlogCategory> {
    return prisma.blogCategory.create({ data });
  }

  update(id: string, data: BlogCategoryUpdateInput): Promise<BlogCategory> {
    return prisma.blogCategory.update({ where: { id }, data });
  }

  delete(id: string): Promise<BlogCategory> {
    return prisma.blogCategory.delete({ where: { id } });
  }

  async reorder(ids: string[]): Promise<void> {
    await prisma.$transaction(
      ids.map((id, index) =>
        prisma.blogCategory.update({ where: { id }, data: { sortOrder: index } })
      )
    );
  }
}
