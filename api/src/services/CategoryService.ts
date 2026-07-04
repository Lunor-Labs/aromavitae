import { AppError } from '@/lib/AppError';
import { logger } from '@/lib/logger';
import { revalidateFrontend } from '@/lib/revalidate';
import { CategoryRepository } from '@/repositories/CategoryRepository';
import type { Category } from '@prisma/client';
import type { CategoryCreateInput, CategoryUpdateInput } from '@/types/category';

export class CategoryService {
  constructor(private repo = new CategoryRepository()) {}

  async getAll(): Promise<Category[]> {
    return this.repo.findAll();
  }

  async getById(id: string): Promise<Category> {
    const c = await this.repo.findById(id);
    if (!c) throw new AppError('Category not found', 404, 'NOT_FOUND');
    return c;
  }

  async create(input: CategoryCreateInput): Promise<Category> {
    const c = await this.repo.create(input);
    logger.info({ id: c.id }, 'Category created');
    await revalidateFrontend();
    return c;
  }

  async update(id: string, input: CategoryUpdateInput): Promise<Category> {
    await this.getById(id);
    const c = await this.repo.update(id, input);
    logger.info({ id: c.id }, 'Category updated');
    await revalidateFrontend();
    return c;
  }

  async delete(id: string): Promise<void> {
    await this.getById(id);
    await this.repo.delete(id);
    logger.info({ id }, 'Category deleted');
    await revalidateFrontend();
  }
}
