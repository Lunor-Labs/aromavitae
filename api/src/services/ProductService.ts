import { AppError } from '@/lib/AppError';
import { logger } from '@/lib/logger';
import { revalidateFrontend } from '@/lib/revalidate';
import { CategoryRepository } from '@/repositories/CategoryRepository';
import { ProductRepository } from '@/repositories/ProductRepository';
import type { ProductCreateInput, ProductUpdateInput, ProductWithCategory } from '@/types/product';

export class ProductService {
  constructor(
    private repo = new ProductRepository(),
    private categories = new CategoryRepository()
  ) {}

  async getAll(): Promise<ProductWithCategory[]> {
    return this.repo.findAll();
  }

  async getById(id: string): Promise<ProductWithCategory> {
    const product = await this.repo.findById(id);
    if (!product) throw new AppError('Product not found', 404, 'NOT_FOUND');
    return product;
  }

  private async assertCategoryExists(categoryId: string | null | undefined): Promise<void> {
    if (!categoryId) return;
    const category = await this.categories.findById(categoryId);
    if (!category) throw new AppError('Category not found', 400, 'INVALID_CATEGORY');
  }

  async create(input: ProductCreateInput): Promise<ProductWithCategory> {
    await this.assertCategoryExists(input.categoryId);
    const product = await this.repo.create(input);
    logger.info({ id: product.id }, 'Product created');
    await revalidateFrontend();
    return product;
  }

  async update(id: string, input: ProductUpdateInput): Promise<ProductWithCategory> {
    await this.getById(id); // throws 404 if missing
    await this.assertCategoryExists(input.categoryId);
    const product = await this.repo.update(id, input);
    logger.info({ id: product.id }, 'Product updated');
    await revalidateFrontend();
    return product;
  }

  async delete(id: string): Promise<void> {
    await this.getById(id);
    await this.repo.delete(id);
    logger.info({ id }, 'Product deleted');
    await revalidateFrontend();
  }

  async reorder(ids: string[]): Promise<void> {
    await this.repo.reorder(ids);
    logger.info({ count: ids.length }, 'Products reordered');
    await revalidateFrontend();
  }
}
