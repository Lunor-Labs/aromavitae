import type { Category, Product, Singleton, Testimonial } from '@prisma/client';

export type { Category, Product, Singleton, Testimonial };

export type ContentPayload = {
  products: Product[];
  categories: Category[];
  testimonials: Testimonial[];
  singletons: Record<string, unknown>;
};
