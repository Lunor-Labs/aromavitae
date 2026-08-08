import { CategoryRepository } from '@/repositories/CategoryRepository';
import { GalleryRepository } from '@/repositories/GalleryRepository';
import { OutletRepository } from '@/repositories/OutletRepository';
import { ProductRepository } from '@/repositories/ProductRepository';
import { TestimonialRepository } from '@/repositories/TestimonialRepository';
import { SingletonService } from '@/services/SingletonService';
import type { ContentPayload } from '@/types';

export class ContentService {
  constructor(
    private products = new ProductRepository(),
    private categories = new CategoryRepository(),
    private testimonials = new TestimonialRepository(),
    private outlets = new OutletRepository(),
    private gallery = new GalleryRepository(),
    private singletons = new SingletonService()
  ) {}

  async getAggregate(): Promise<ContentPayload> {
    const [products, categories, testimonials, outlets, gallery, singletons] = await Promise.all([
      this.products.findAll(),
      this.categories.findAll(),
      this.testimonials.findAll(),
      this.outlets.findAll(),
      this.gallery.findAll(),
      this.singletons.getAllMap(),
    ]);
    return { products, categories, testimonials, outlets, gallery, singletons };
  }
}
