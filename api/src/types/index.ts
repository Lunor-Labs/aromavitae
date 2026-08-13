import type { BlogCategory, Category, GalleryImage, Outlet, Product, Singleton, Testimonial } from '@prisma/client';
import type { ProductWithCategory } from '@/types/product';
import type { BlogPostWithCategory } from '@/types/blog';

export type { BlogCategory, Category, GalleryImage, Outlet, Product, Singleton, Testimonial };
export type { ProductWithCategory, BlogPostWithCategory };

export type ContentPayload = {
  products: ProductWithCategory[];
  categories: Category[];
  testimonials: Testimonial[];
  outlets: Outlet[];
  gallery: GalleryImage[];
  blogPosts: BlogPostWithCategory[];
  blogCategories: BlogCategory[];
  singletons: Record<string, unknown>;
};
