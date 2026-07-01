import type {
  ContentPayload,
  AnnouncementContent,
  FooterContent,
  GiftSetsBannerContent,
  HeroContent,
  NavbarContent,
  StoryContent,
} from "@/types/content";

const API_URL = process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? "";

type Envelope<T> = { data: T };

const FALLBACK_CONTENT: ContentPayload = {
  products: [],
  categories: [],
  testimonials: [],
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
  // Skip the API round-trip during `next build`. The API isn't reachable from
  // Vercel's build runner, and the page is force-dynamic anyway — real content
  // is fetched on every request at runtime.
  if (process.env.NEXT_PHASE === "phase-production-build") return FALLBACK_CONTENT;
  try {
    const res = await fetch(`${API_URL}/api/v1/content`, {
      cache: "no-store",
      signal: AbortSignal.timeout(10_000),
    });
    if (!res.ok) throw new Error(`Failed to load content: ${res.status}`);
    const json = (await res.json()) as Envelope<ContentPayload>;
    return json.data;
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
