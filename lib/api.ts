import type {
  ContentPayload,
  AnnouncementContent,
  FooterContent,
  GiftSetsBannerContent,
  HeroContent,
  NavbarContent,
  StoryContent,
} from "@/types/content";
import { STORAGE_BASE_URL } from "@/lib/storage";

const API_URL = process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? "";

/**
 * Convert relative image paths (e.g. "/images/products/cinnamon.png") that
 * were baked into the DB seed into full Supabase Storage public URLs.
 * Already-absolute URLs (https://...) are left untouched.
 */
function resolveImageUrl(url: string): string {
  if (!url) return url;
  if (url.startsWith("http")) return url;
  // "/images/products/foo.png" → "products/foo.png"
  const stripped = url.replace(/^\/images\//, "");
  return `${STORAGE_BASE_URL}/${stripped}`;
}

/** Walk the content payload and resolve every image field. */
function normalizeImages(data: ContentPayload): ContentPayload {
  return {
    ...data,
    products: (data.products ?? []).map((p) => ({ ...p, image: resolveImageUrl(p.image) })),
    categories: (data.categories ?? []).map((c) => ({ ...c, image: resolveImageUrl(c.image) })),
    testimonials: data.testimonials ?? [],
    outlets: (data.outlets ?? []).map((o) => ({ ...o, image: resolveImageUrl(o.image) })),
    singletons: {
      ...data.singletons,
      // hero and story images are served from public/ — not resolved to Supabase
      giftSetsBanner: {
        ...data.singletons.giftSetsBanner,
        image: resolveImageUrl(data.singletons.giftSetsBanner.image),
      },
    },
  };
}

type Envelope<T> = { data: T };

const FALLBACK_CONTENT: ContentPayload = {
  products: [],
  categories: [],
  testimonials: [],
  outlets: [],
  singletons: {
    hero: { slides: [] } as HeroContent,
    story: {
      ourStory: { eyebrow: "", heading: "", body: "", ctaLabel: "", ctaHref: "" },
      heritage: { eyebrow: "", heading: "", body: "", ctaLabel: "", ctaHref: "", badges: [] },
    } as StoryContent,
    navbar: { brand: { name: "", tagline: "" }, links: [], cta: { label: "", href: "" } } as NavbarContent,
    footer: {
      brand: { name: "", tagline: "", description: "" },
      columns: [],
      contact: { phone: "", email: "", location: "" },
      newsletter: { title: "", body: "" },
      social: [],
      payments: [],
      legal: { copyright: "" },
    } as FooterContent,
    announcement: { messages: [] } as AnnouncementContent,
    giftSetsBanner: { eyebrow: "", heading: "", body: "", image: "", ctaLabel: "", ctaHref: "" } as GiftSetsBannerContent,
  },
};

export async function fetchContent(): Promise<ContentPayload> {
  if (!API_URL) return FALLBACK_CONTENT;
  // Skip the API round-trip during `next build`. Callers MUST opt into dynamic
  // rendering (`export const dynamic = "force-dynamic"` in app/layout.tsx and
  // app/page.tsx) — otherwise Next.js caches this empty fallback into the
  // static prerender and every API-driven image disappears in prod.
  if (process.env.NEXT_PHASE === "phase-production-build") return FALLBACK_CONTENT;
  try {
    const res = await fetch(`${API_URL}/api/v1/content`, {
      cache: "no-store",
      signal: AbortSignal.timeout(30_000),
    });
    if (!res.ok) throw new Error(`Failed to load content: ${res.status}`);
    const json = (await res.json()) as Envelope<ContentPayload>;
    return normalizeImages(json.data);
  } catch {
    return FALLBACK_CONTENT;
  }
}

// ---- Admin browser client (signed requests) ----

export class ApiError extends Error {
  constructor(public status: number, message: string, public code?: string) {
    super(message);
  }
}

export interface ApiClientOptions {
  token: string;
}

export class AdminApi {
  constructor(private opts: ApiClientOptions) {}

  private async request<T>(path: string, init: RequestInit = {}): Promise<T> {
    const res = await fetch(`${API_URL}/api/v1${path}`, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        ...(init.headers ?? {}),
        Authorization: `Bearer ${this.opts.token}`,
      },
    });
    if (res.status === 204) return undefined as T;
    const body = await res.json().catch(() => ({}));
    if (!res.ok) {
      const err = (body as { error?: { code?: string; message?: string } }).error;
      throw new ApiError(res.status, err?.message ?? `Request failed (${res.status})`, err?.code);
    }
    return (body as Envelope<T>).data;
  }

  get<T>(path: string) { return this.request<T>(path); }
  post<T>(path: string, body: unknown) { return this.request<T>(path, { method: "POST", body: JSON.stringify(body) }); }
  put<T>(path: string, body: unknown) { return this.request<T>(path, { method: "PUT", body: JSON.stringify(body) }); }
  del(path: string) { return this.request<void>(path, { method: "DELETE" }); }
}
