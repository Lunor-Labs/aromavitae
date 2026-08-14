import { prisma } from '@/lib/prisma';
import type { BlogPost } from '@prisma/client';
import type { BlogPostCreateInput, BlogPostUpdateInput, BlogPostWithCategory } from '@/types/blog';

const categoryInclude = { category: { select: { id: true, name: true } } } as const;

export class BlogPostRepository {
  findAll(): Promise<BlogPostWithCategory[]> {
    return prisma.blogPost.findMany({
      orderBy: [{ sortOrder: 'asc' }, { publishedAt: 'desc' }],
      include: categoryInclude,
    });
  }

  findById(id: string): Promise<BlogPostWithCategory | null> {
    return prisma.blogPost.findUnique({ where: { id }, include: categoryInclude });
  }

  findBySlug(slug: string): Promise<BlogPostWithCategory | null> {
    return prisma.blogPost.findUnique({ where: { slug }, include: categoryInclude });
  }

  create(data: BlogPostCreateInput): Promise<BlogPostWithCategory> {
    return prisma.blogPost.create({ data, include: categoryInclude });
  }

  update(id: string, data: BlogPostUpdateInput): Promise<BlogPostWithCategory> {
    return prisma.blogPost.update({ where: { id }, data, include: categoryInclude });
  }

  delete(id: string): Promise<BlogPost> {
    return prisma.blogPost.delete({ where: { id } });
  }

  async reorder(ids: string[]): Promise<void> {
    await prisma.$transaction(
      ids.map((id, index) =>
        prisma.blogPost.update({ where: { id }, data: { sortOrder: index } })
      )
    );
  }
}
