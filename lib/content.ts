import { cache } from "react";
import { connection } from "next/server";
import { convertLexicalToHTML } from "@payloadcms/richtext-lexical/html";
import type {
  Announcement as AnnouncementDoc,
  BlogCategory as BlogCategoryDoc,
  BlogPost as BlogPostDoc,
  Category as CategoryDoc,
  Footer as FooterDoc,
  GalleryImage as GalleryImageDoc,
  GiftSetsBanner as GiftSetsBannerDoc,
  Hero as HeroDoc,
  Media,
  Outlet as OutletDoc,
  Product as ProductDoc,
  Story as StoryDoc,
  Testimonial as TestimonialDoc,
} from "@/payload/payload-types";
import type { ContentPayload, HeroContent, HeroSlide, ImageAsset, StoryContent } from "@/types/content";
import type { BlogPost, Product } from "@/types/product";

/**
 * The site's read side. Everything is read from Payload's REST API — on Vercel
 * that is the CMS on the VPS (`CMS_URL`) — and mapped onto the view models in
 * `types/` so components never see Payload's document shapes.
 *
 * Responses are cached and refreshed at most once a minute, so admin edits
 * reach the site within a minute without a redeploy. A failed read throws
 * instead of returning empty content: a failed refresh then keeps serving the
 * last good page rather than replacing it with a blank one.
 */

/** How often, in seconds, cached CMS content is refreshed. */
const REVALIDATE_SECONDS = 60;

/**
 * Vercel sets `CMS_URL`. Without it (local dev, and the CMS's own deployment)
 * the app reads from its own API.
 */
const cmsUrl = () =>
  (process.env.CMS_URL || process.env.SERVER_URL || "http://localhost:3000").replace(/\/+$/, "");

// Shown until the Hero / Our Story globals are filled in the admin.
const DEFAULT_HERO_SLIDES: HeroSlide[] = [
  {
    heading: "Nature's Finest,\nCeylon's Pride",
    subheading:
      "Discover the timeless aroma of Sri Lanka, premium spices and agarwood perfumes handcrafted with passion.",
    desktopImage: null,
    mobileImage: null,
    ctaPrimary: { label: "SHOP SPICES", href: "/products" },
    ctaSecondary: { label: "EXPLORE PERFUMES", href: "/products" },
  },
];
const DEFAULT_AUTOPLAY_MS = 6000;

const DEFAULT_STORY: StoryContent = {
  ourStory: {
    eyebrow: "OUR STORY",
    heading: "Rooted in\nSri Lankan tradition",
    body: "For generations, our family has walked the misty hills and coastal plantations of Ceylon, curating the island's finest spices and its rarest agarwood. Every jar and vial carries that heritage.",
    ctaLabel: "READ MORE",
    ctaHref: "/about",
  },
  heritage: {
    eyebrow: "HERITAGE",
    heading: "Crafted with care, aged with time",
    body: "Small-batch, hand-selected, and slow-cured. Our products are made the way they always have been.",
    ctaLabel: "EXPLORE OUR HERITAGE",
    ctaHref: "/about",
    badges: [
      { icon: "book", label: "Centuries of\ntradition" },
      { icon: "leaf", label: "100% Organic" },
      { icon: "shield", label: "Purity assured" },
    ],
  },
};

const isBuildPhase = () => process.env.NEXT_PHASE === "phase-production-build";

/**
 * A build with `CMS_URL` (Vercel) renders pages from the CMS ahead of time. A
 * build without it (the Docker image) has no CMS to read from yet, so its pages
 * are left to render on request instead.
 */
async function waitForCms() {
  if (isBuildPhase() && !process.env.CMS_URL) await connection();
}

/**
 * A merge to main redeploys the CMS just before the site, so a site build can
 * catch it mid-restart. Builds retry through that; requests fail at once and
 * keep the last good page. Kept under Next's 60s per-page build timeout.
 */
const BUILD_ATTEMPTS = 5;
const BUILD_RETRY_MS = 10_000;

async function fetchCms(url: URL): Promise<Response> {
  const attempts = isBuildPhase() ? BUILD_ATTEMPTS : 1;
  for (let attempt = 1; ; attempt++) {
    try {
      const res = await fetch(url, { next: { revalidate: REVALIDATE_SECONDS, tags: ["cms"] } });
      if (res.status < 500 || attempt >= attempts) return res;
    } catch (error) {
      if (attempt >= attempts) throw error;
    }
    await new Promise((resolve) => setTimeout(resolve, BUILD_RETRY_MS));
  }
}

/** GET a Payload REST endpoint. Resolves to null on 404, throws on any other failure. */
async function cms<T>(path: string, params: Record<string, string | number> = {}): Promise<T | null> {
  const url = new URL(`/api/${path}`, cmsUrl());
  for (const [key, value] of Object.entries(params)) url.searchParams.set(key, String(value));

  const res = await fetchCms(url);
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`CMS request failed: ${res.status} ${url.pathname}${url.search}`);
  return (await res.json()) as T;
}

/** A collection or global, which always exists. */
async function cmsRequired<T>(path: string, params?: Record<string, string | number>): Promise<T> {
  const data = await cms<T>(path, params);
  if (!data) throw new Error(`CMS request failed: 404 /api/${path}`);
  return data;
}

type Docs<T> = { docs: T[] };

/** Upload fields come back as a populated doc at depth >= 1, or a bare id when not. */
function mediaUrl(media: number | Media | null | undefined): string {
  return typeof media === "object" && media?.url ? media.url : "";
}

function imageAsset(media: number | Media | null | undefined): ImageAsset | null {
  if (typeof media !== "object" || !media?.url || !media.width || !media.height) return null;
  return { url: media.url, width: media.width, height: media.height, alt: media.alt ?? "" };
}

function toProduct(doc: ProductDoc): Product {
  const category = typeof doc.category === "object" ? doc.category : null;
  return {
    id: String(doc.id),
    name: doc.name,
    price: doc.price,
    sizeValue: doc.sizeValue ?? null,
    sizeUnit: doc.sizeUnit ?? null,
    currency: doc.currency,
    rating: doc.rating,
    reviewCount: doc.reviewCount,
    image: mediaUrl(doc.image),
    sideImages: (doc.sideImages ?? []).map(mediaUrl).filter(Boolean),
    description: doc.description ?? null,
    tags: doc.tags ?? [],
    isBestSeller: Boolean(doc.isBestSeller),
    categoryId: category ? String(category.id) : doc.category ? String(doc.category) : null,
    category: category ? { id: String(category.id), name: category.name } : null,
  };
}

function toBlogPost(doc: BlogPostDoc): BlogPost {
  const category = typeof doc.category === "object" ? doc.category : null;
  return {
    id: String(doc.id),
    title: doc.title,
    slug: doc.slug,
    excerpt: doc.excerpt,
    // Lexical's converter escapes text and only emits the node types the
    // editor allows, so the result is safe to render as HTML.
    content: convertLexicalToHTML({ data: doc.content, disableContainer: true }),
    coverImage: mediaUrl(doc.coverImage),
    categoryId: category ? String(category.id) : doc.category ? String(doc.category) : null,
    category: category ? { id: String(category.id), name: category.name } : null,
    isFeatured: Boolean(doc.isFeatured),
    publishedAt: doc.publishedAt,
  };
}

function toHero(doc: HeroDoc): HeroContent {
  const slides = (doc.slides ?? []).map((s) => ({
    heading: s.heading,
    subheading: s.subheading,
    desktopImage: imageAsset(s.desktopImage),
    mobileImage: imageAsset(s.mobileImage),
    ctaPrimary: s.ctaPrimary,
    ctaSecondary: s.ctaSecondary,
  }));
  return {
    slides: slides.length > 0 ? slides : DEFAULT_HERO_SLIDES,
    autoPlayMs: doc.autoPlayMs ?? DEFAULT_AUTOPLAY_MS,
  };
}

function toStory(doc: StoryDoc): StoryContent {
  // A global that has never been saved comes back with empty groups
  if (!doc.ourStory?.heading || !doc.heritage?.heading) return DEFAULT_STORY;
  return {
    ourStory: doc.ourStory,
    heritage: { ...doc.heritage, badges: doc.heritage.badges ?? [] },
  };
}

/**
 * Everything the layout and pages render. Wrapped in `cache` so the layout and
 * the page share one round of requests per render.
 */
export const getContent = cache(async (): Promise<ContentPayload> => {
  await waitForCms();
  const all = { pagination: "false", sort: "_order", depth: 1 };

  const [products, categories, testimonials, outlets, gallery, blogPosts, blogCategories] =
    await Promise.all([
      cmsRequired<Docs<ProductDoc>>("products", all),
      cmsRequired<Docs<CategoryDoc>>("categories", all),
      cmsRequired<Docs<TestimonialDoc>>("testimonials", all),
      cmsRequired<Docs<OutletDoc>>("outlets", all),
      cmsRequired<Docs<GalleryImageDoc>>("gallery-images", all),
      cmsRequired<Docs<BlogPostDoc>>("blog-posts", all),
      cmsRequired<Docs<BlogCategoryDoc>>("blog-categories", all),
    ]);

  const [hero, story, footer, announcement, giftSetsBanner] = await Promise.all([
    cmsRequired<HeroDoc>("globals/hero", { depth: 1 }),
    cmsRequired<StoryDoc>("globals/story"),
    cmsRequired<FooterDoc>("globals/footer"),
    cmsRequired<AnnouncementDoc>("globals/announcement"),
    cmsRequired<GiftSetsBannerDoc>("globals/gift-sets-banner", { depth: 1 }),
  ]);

  const giftSetsImage = mediaUrl(giftSetsBanner.image);

  return {
    products: products.docs.map(toProduct),
    categories: categories.docs.map((c) => ({
      id: String(c.id),
      name: c.name,
      image: mediaUrl(c.image),
    })),
    testimonials: testimonials.docs.map((t) => ({
      id: String(t.id),
      quote: t.quote,
      author: t.author,
      location: t.location,
      rating: t.rating,
      imageA: mediaUrl(t.imageA) || null,
      imageB: mediaUrl(t.imageB) || null,
    })),
    outlets: outlets.docs.map((o) => ({
      id: String(o.id),
      name: o.name,
      address: o.address,
      phone: o.phone,
      description: o.description,
      image: mediaUrl(o.image),
    })),
    gallery: gallery.docs.map((g) => ({
      id: String(g.id),
      image: mediaUrl(g.image),
      alt: g.alt ?? "",
      tags: g.tags,
      span: g.span ?? null,
    })),
    blogPosts: blogPosts.docs.map(toBlogPost),
    blogCategories: blogCategories.docs.map((c) => ({ id: String(c.id), name: c.name })),
    singletons: {
      hero: toHero(hero),
      story: toStory(story),
      footer: { social: (footer.social ?? []).map((s) => ({ label: s.platform, href: s.url })) },
      announcement: { messages: (announcement.messages ?? []).map((m) => m.text) },
      giftSetsBanner: giftSetsImage
        ? {
            eyebrow: giftSetsBanner.eyebrow ?? "",
            heading: giftSetsBanner.heading,
            body: giftSetsBanner.body ?? "",
            image: giftSetsImage,
            ctaLabel: giftSetsBanner.ctaLabel ?? "",
            ctaHref: giftSetsBanner.ctaHref ?? "",
          }
        : null,
    },
  };
});

const isPayloadId = (id: string) => /^\d+$/.test(id);

/** A single product by its id, or null when there is none — callers notFound(). */
export const getProduct = cache(async (id: string): Promise<Product | null> => {
  if (!isPayloadId(id)) return null;
  await waitForCms();
  const doc = await cms<ProductDoc>(`products/${id}`, { depth: 1 });
  return doc ? toProduct(doc) : null;
});

/**
 * Product links from before the move to Payload carry the old admin's id
 * (`/products/cm1x...`). Returns the current id so those links can redirect.
 */
export async function getProductIdByLegacyId(legacyId: string): Promise<string | null> {
  if (isPayloadId(legacyId)) return null;
  await waitForCms();
  const { docs } = await cmsRequired<Docs<Pick<ProductDoc, "id">>>("products", {
    "where[legacyId][equals]": legacyId,
    limit: 1,
    depth: 0,
    "select[id]": "true",
  });
  return docs[0] ? String(docs[0].id) : null;
}

/** A single blog post by slug, or null when there is none — callers notFound(). */
export const getBlogPost = cache(async (slug: string): Promise<BlogPost | null> => {
  await waitForCms();
  const { docs } = await cmsRequired<Docs<BlogPostDoc>>("blog-posts", {
    "where[slug][equals]": slug,
    limit: 1,
    depth: 1,
  });
  return docs[0] ? toBlogPost(docs[0]) : null;
});
