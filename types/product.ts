export interface Product {
  id: string;
  name: string;
  price: number;
  currency: string;
  rating: number;
  reviewCount: number;
  image: string;
  badge?: string;
  category: string;
}

export interface Category {
  id: string;
  name: string;
  image: string;
  href: string;
}

export interface Testimonial {
  id: string;
  quote: string;
  author: string;
  location: string;
  rating: number;
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
