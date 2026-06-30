import { CategoryRepository } from '@/repositories/CategoryRepository';
import { ProductRepository } from '@/repositories/ProductRepository';
import { TestimonialRepository } from '@/repositories/TestimonialRepository';
import { SingletonService } from '@/services/SingletonService';
import type { ContentPayload } from '@/types';

export class ContentService {
  constructor(
    private products = new ProductRepository(),
    private categories = new CategoryRepository(),
    private testimonials = new TestimonialRepository(),
    private singletons = new SingletonService()
  ) {}

  async getAggregate(): Promise<ContentPayload> {
    const [products, categories, testimonials, singletons] = await Promise.all([
      this.products.findAll(),
      this.categories.findAll(),
      this.testimonials.findAll(),
      this.singletons.getAllMap(),
    ]);
    return { products, categories, testimonials, singletons };
  }
}
