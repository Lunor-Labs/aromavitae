import type { ContactDetails } from "@/lib/site";
import type { BlogCategory, BlogPost, Category, GalleryImage, Outlet, Product, Testimonial } from "./product";

export interface CtaLink {
  label: string;
  href: string;
}

/** An uploaded picture with the intrinsic size next/image needs for art direction. */
export interface ImageAsset {
  url: string;
  width: number;
  height: number;
  alt: string;
}

export interface HeroSlide {
  heading: string;
  subheading: string;
  /** Null shows the built-in banner from public/images/hero. */
  desktopImage: ImageAsset | null;
  /** Null falls back to desktopImage. */
  mobileImage: ImageAsset | null;
  ctaPrimary: CtaLink;
  ctaSecondary: CtaLink;
}

export interface HeroContent {
  slides: HeroSlide[];
  autoPlayMs: number;
}

export interface StoryPanel {
  eyebrow: string;
  heading: string;
  body: string;
  ctaLabel: string;
  ctaHref: string;
}

export interface StoryBadge {
  icon: string;
  label: string;
}

export interface StoryContent {
  ourStory: StoryPanel;
  heritage: StoryPanel & { badges: StoryBadge[] };
}

export interface FooterContent {
  /** `label` is the platform key (facebook, instagram, ...) that picks the icon. */
  social: CtaLink[];
}

export interface AnnouncementContent {
  messages: string[];
}

export interface GiftSetsBannerContent {
  eyebrow: string;
  heading: string;
  body: string;
  image: string;
  ctaLabel: string;
  ctaHref: string;
}

/** Exchange rates: how many LKR one unit costs. A currency with no rate isn't offered. */
export interface ExchangeRates {
  USD?: number;
  EUR?: number;
  GBP?: number;
}

export interface ShopContent {
  mode: "off" | "test" | "live";
  rates: ExchangeRates;
}

export interface LegalPageLink {
  title: string;
  slug: string;
}

export interface ContentPayload {
  products: Product[];
  categories: Category[];
  testimonials: Testimonial[];
  outlets: Outlet[];
  gallery: GalleryImage[];
  blogPosts: BlogPost[];
  blogCategories: BlogCategory[];
  legalPages: LegalPageLink[];
  singletons: {
    hero: HeroContent;
    story: StoryContent;
    footer: FooterContent;
    announcement: AnnouncementContent;
    contact: ContactDetails;
    shop: ShopContent;
    /** Null until a banner with an image has been saved in the admin. */
    giftSetsBanner: GiftSetsBannerContent | null;
  };
}
