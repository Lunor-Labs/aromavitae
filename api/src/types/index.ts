import type { Category, GalleryImage, Outlet, Product, Singleton, Testimonial } from '@prisma/client';
import type { ProductWithCategory } from '@/types/product';

export type { Category, GalleryImage, Outlet, Product, Singleton, Testimonial };
export type { ProductWithCategory };

export type ContentPayload = {
  products: ProductWithCategory[];
  categories: Category[];
  testimonials: Testimonial[];
  outlets: Outlet[];
  gallery: GalleryImage[];
  singletons: Record<string, unknown>;
};
