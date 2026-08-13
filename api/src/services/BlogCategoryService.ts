import { AppError } from '@/lib/AppError';
import { logger } from '@/lib/logger';
import { revalidateFrontend } from '@/lib/revalidate';
import { BlogCategoryRepository } from '@/repositories/BlogCategoryRepository';
import type { BlogCategory } from '@prisma/client';
import type { BlogCategoryCreateInput, BlogCategoryUpdateInput } from '@/types/blogCategory';

export class BlogCategoryService {
  constructor(private repo = new BlogCategoryRepository()) {}

  async getAll(): Promise<BlogCategory[]> {
    return this.repo.findAll();
  }

  async getById(id: string): Promise<BlogCategory> {
    const c = await this.repo.findById(id);
    if (!c) throw new AppError('Blog category not found', 404, 'NOT_FOUND');
    return c;
  }

  async create(input: BlogCategoryCreateInput): Promise<BlogCategory> {
    const c = await this.repo.create(input);
    logger.info({ id: c.id }, 'Blog category created');
    await revalidateFrontend();
    return c;
  }

  async update(id: string, input: BlogCategoryUpdateInput): Promise<BlogCategory> {
    await this.getById(id);
    const c = await this.repo.update(id, input);
    logger.info({ id: c.id }, 'Blog category updated');
    await revalidateFrontend();
    return c;
  }

  async delete(id: string): Promise<void> {
    await this.getById(id);
    await this.repo.delete(id);
    logger.info({ id }, 'Blog category deleted');
    await revalidateFrontend();
  }

  async reorder(ids: string[]): Promise<void> {
    await this.repo.reorder(ids);
    logger.info({ count: ids.length }, 'Blog categories reordered');
    await revalidateFrontend();
  }
}
