// Also the options of the size unit select in payload/collections/Products.ts
export const SIZE_UNITS = ["ml", "g", "kg", "pcs"] as const;
export type SizeUnit = (typeof SIZE_UNITS)[number];

/** One size of a product, with its own price and photo. */
export interface ProductVariant {
  id: string;
  sizeValue: number;
  sizeUnit: SizeUnit;
  price: number;
  salePrice?: number | null;
  image?: string | null;
}

export interface Product {
  id: string;
  name: string;
  /** With variants, the cheapest size's price — the "From" price. */
  price: number;
  /** Discounted price, shown with `price` struck through. */
  salePrice?: number | null;
  /** Volume/weight amount, paired with sizeUnit. Null on products created before sizes existed. */
  sizeValue?: number | null;
  sizeUnit?: SizeUnit | null;
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
  /** Empty for a single-size product. The first one is the default pick. */
  variants: ProductVariant[];
}

export interface Category {
  id: string;
  name: string;
  image: string;
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
