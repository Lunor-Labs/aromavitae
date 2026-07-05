import type { Category, Outlet, Product, Singleton, Testimonial } from '@prisma/client';

export type { Category, Outlet, Product, Singleton, Testimonial };

export type ContentPayload = {
  products: Product[];
  categories: Category[];
  testimonials: Testimonial[];
  outlets: Outlet[];
  singletons: Record<string, unknown>;
};
