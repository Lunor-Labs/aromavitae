import { cache } from "react";
import { getPayload } from "payload";
import config from "@payload-config";
import { convertLexicalToHTML } from "@payloadcms/richtext-lexical/html";
import type {
  BlogPost as BlogPostDoc,
  Hero as HeroDoc,
  Media,
  Product as ProductDoc,
  Story as StoryDoc,
} from "@/payload/payload-types";
import type { ContentPayload, HeroContent, HeroSlide, ImageAsset, StoryContent } from "@/types/content";
import type { BlogPost, Product } from "@/types/product";

/**
 * The site's read side. Everything goes through Payload's Local API — a direct
 * database call inside this Next.js process, no HTTP — and is mapped onto the
 * view models in `types/` so components never see Payload's document shapes.
 *
 * Every read degrades to empty content rather than throwing, so a database
 * hiccup blanks sections instead of taking the whole site down.
 */

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

const EMPTY_CONTENT: ContentPayload = {
  products: [],
  categories: [],
  testimonials: [],
  outlets: [],
  gallery: [],
  blogPosts: [],
  blogCategories: [],
  singletons: {
    hero: { slides: DEFAULT_HERO_SLIDES, autoPlayMs: DEFAULT_AUTOPLAY_MS },
    story: DEFAULT_STORY,
    footer: { social: [] },
    announcement: { messages: [] },
    giftSetsBanner: null,
  },
};

/**
 * `next build` has no database to talk to. Every page that calls in here is
 * `force-dynamic`, so nothing built during this phase is ever served — this
 * only keeps the build from trying to connect.
 */
const isBuildPhase = () => process.env.NEXT_PHASE === "phase-production-build";

const getClient = () => getPayload({ config });

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
 * the page share one round of queries per request.
 */
export const getContent = cache(async (): Promise<ContentPayload> => {
  if (isBuildPhase()) return EMPTY_CONTENT;
  try {
    const payload = await getClient();
    const all = { pagination: false, sort: "_order", depth: 1 } as const;

    const [products, categories, testimonials, outlets, gallery, blogPosts, blogCategories] =
      await Promise.all([
        payload.find({ collection: "products", ...all }),
        payload.find({ collection: "categories", ...all }),
        payload.find({ collection: "testimonials", ...all }),
        payload.find({ collection: "outlets", ...all }),
        payload.find({ collection: "gallery-images", ...all }),
        payload.find({ collection: "blog-posts", ...all }),
        payload.find({ collection: "blog-categories", ...all }),
      ]);

    const [hero, story, footer, announcement, giftSetsBanner] = await Promise.all([
      payload.findGlobal({ slug: "hero", depth: 1 }),
      payload.findGlobal({ slug: "story" }),
      payload.findGlobal({ slug: "footer" }),
      payload.findGlobal({ slug: "announcement" }),
      payload.findGlobal({ slug: "gift-sets-banner", depth: 1 }),
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
  } catch (error) {
    console.error("Failed to load site content", error);
    return EMPTY_CONTENT;
  }
});

const isPayloadId = (id: string) => /^\d+$/.test(id);

/** A single product by its id, or null when there is none — callers notFound(). */
export const getProduct = cache(async (id: string): Promise<Product | null> => {
  if (isBuildPhase() || !isPayloadId(id)) return null;
  try {
    const payload = await getClient();
    const doc = await payload.findByID({ collection: "products", id: Number(id), depth: 1, disableErrors: true });
    return doc ? toProduct(doc) : null;
  } catch (error) {
    console.error(`Failed to load product ${id}`, error);
    return null;
  }
});

/**
 * Product links from before the move to Payload carry the old admin's id
 * (`/products/cm1x...`). Returns the current id so those links can redirect.
 */
export async function getProductIdByLegacyId(legacyId: string): Promise<string | null> {
  if (isBuildPhase() || isPayloadId(legacyId)) return null;
  try {
    const payload = await getClient();
    const { docs } = await payload.find({
      collection: "products",
      where: { legacyId: { equals: legacyId } },
      limit: 1,
      depth: 0,
      select: {},
    });
    return docs[0] ? String(docs[0].id) : null;
  } catch (error) {
    console.error(`Failed to look up legacy product ${legacyId}`, error);
    return null;
  }
}

/** A single blog post by slug, or null when there is none — callers notFound(). */
export const getBlogPost = cache(async (slug: string): Promise<BlogPost | null> => {
  if (isBuildPhase()) return null;
  try {
    const payload = await getClient();
    const { docs } = await payload.find({
      collection: "blog-posts",
      where: { slug: { equals: slug } },
      limit: 1,
      depth: 1,
    });
    return docs[0] ? toBlogPost(docs[0]) : null;
  } catch (error) {
    console.error(`Failed to load blog post ${slug}`, error);
    return null;
  }
});
