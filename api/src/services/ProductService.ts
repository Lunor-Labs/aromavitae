import { AppError } from '@/lib/AppError';
import { logger } from '@/lib/logger';
import { revalidateFrontend } from '@/lib/revalidate';
import { ProductRepository } from '@/repositories/ProductRepository';
import type { Product } from '@prisma/client';
import type { ProductCreateInput, ProductUpdateInput } from '@/types/product';

export class ProductService {
  constructor(private repo = new ProductRepository()) {}

  async getAll(): Promise<Product[]> {
    return this.repo.findAll();
  }

  async getById(id: string): Promise<Product> {
    const product = await this.repo.findById(id);
    if (!product) throw new AppError('Product not found', 404, 'NOT_FOUND');
    return product;
  }

  async create(input: ProductCreateInput): Promise<Product> {
    const product = await this.repo.create(input);
    logger.info({ id: product.id }, 'Product created');
    await revalidateFrontend();
    return product;
  }

  async update(id: string, input: ProductUpdateInput): Promise<Product> {
    await this.getById(id); // throws 404 if missing
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
}
