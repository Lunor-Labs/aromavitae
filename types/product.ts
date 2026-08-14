export interface Product {
  id: string;
  name: string;
  price: number;
  currency: string;
  rating: number;
  reviewCount: number;
  image: string;
  sideImages: string[];
  description?: string | null;
  tags: string[];
  isBestSeller: boolean;
  categoryId?: string | null;
  category?: { id: string; name: string } | null;
}

export interface Category {
  id: string;
  name: string;
  image: string;
  href: string;
}

export interface GalleryImage {
  id: string;
  image: string;
  alt: string;
  tags: string[];
  span?: "tall" | "wide" | null;
}

export interface BlogCategory {
  id: string;
  name: string;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage: string;
  categoryId?: string | null;
  category?: { id: string; name: string } | null;
  isFeatured: boolean;
  publishedAt: string;
}

export interface Testimonial {
  id: string;
  quote: string;
  author: string;
  location: string;
  rating: number;
  imageA?: string | null;
  imageB?: string | null;
}

export interface Outlet {
  id: string;
  name: string;
  address: string;
  phone: string;
  description: string;
  image: string;
  sortOrder?: number;
}

export interface NavLink {
  label: string;
  href: string;
  children?: NavLink[];
}

export interface TrustBadge {
  icon: string;
  title: string;
  subtitle: string;
}
