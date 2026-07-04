import type { Category, Product, Testimonial } from "./product";

export interface CtaLink {
  label: string;
  href: string;
}

export interface HeroSlide {
  heading: string;
  subheading: string;
  image: string;
  ctaPrimary: CtaLink;
  ctaSecondary: CtaLink;
}

export interface HeroContent {
  slides: HeroSlide[];
  autoPlayMs?: number;
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

export interface NavLinkItem {
  label: string;
  href: string;
  children?: { label: string; href: string }[];
}

export interface NavbarContent {
  brand: { name: string; tagline: string };
  links: NavLinkItem[];
  cta: CtaLink;
}

export interface FooterColumn {
  title: string;
  links: CtaLink[];
}

export interface FooterContent {
  brand: { name: string; tagline: string; description: string };
  columns: FooterColumn[];
  contact: { phone: string; email: string; location: string };
  newsletter: { title: string; body: string };
  social: CtaLink[];
  payments: string[];
  legal: { copyright: string };
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

export interface ContentPayload {
  products: Product[];
  categories: Category[];
  testimonials: Testimonial[];
  singletons: {
    hero: HeroContent;
    story: StoryContent;
    navbar: NavbarContent;
    footer: FooterContent;
    announcement: AnnouncementContent;
    giftSetsBanner: GiftSetsBannerContent;
  };
}
