/**
 * One-off copy of the old Express/Prisma database into Payload.
 *
 *   npm run migrate:legacy
 *
 * Reads LEGACY_DATABASE_URL (the old Prisma database, read-only here) and
 * writes into DATABASE_URI (Payload's own database) through the Local API, so
 * every document goes through the same validation as an admin edit.
 *
 * - Images are downloaded from their current public URLs and uploaded again as
 *   Media (into `media/` in the bucket). The old objects are left untouched, so
 *   any URL already out there keeps working.
 * - Each product keeps its old id in `legacyId`; /products/<old id> redirects.
 * - Blog HTML is converted to the Lexical editor format.
 * - Hero and Our Story are not copied: the live site shows the copy built into
 *   the code, not the database rows, and leaving the globals empty keeps it.
 * - Admin passwords can't be carried over (bcrypt vs Payload's own hashing),
 *   so each old admin email gets a new random password, printed at the end.
 *
 * All database writes happen in one transaction: if anything fails, nothing is
 * written (uploaded image files may be left behind in the bucket). It refuses
 * to run when Payload already has content.
 */
import { randomBytes } from "node:crypto";
import path from "node:path";
import { JSDOM } from "jsdom";
import pg from "pg";
import {
  commitTransaction,
  createLocalReq,
  getPayload,
  initTransaction,
  killTransaction,
  type Payload,
  type PayloadRequest,
  type RichTextField,
} from "payload";
import { convertHTMLToLexical, editorConfigFactory } from "@payloadcms/richtext-lexical";
import config from "../payload.config";
import { SOCIAL_PLATFORMS } from "../globals/Footer";
import { SIZE_UNITS } from "../../types/product";

type Row = Record<string, unknown>;

const legacyUrl = process.env.LEGACY_DATABASE_URL;
const assetBaseUrl = (process.env.NEXT_PUBLIC_ASSET_BASE_URL ?? "").replace(/\/+$/, "");

const EXTENSION_MIME: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".avif": "image/avif",
};

/** Same rule the old site used: relative `/images/x/y.png` lives at `<bucket>/x/y.png`. */
function resolveLegacyUrl(url: string): string {
  if (/^https?:\/\//i.test(url)) return url;
  return `${assetBaseUrl}/${url.replace(/^\/?images\//, "").replace(/^\/+/, "")}`;
}

class Importer {
  private mediaByUrl = new Map<string, number>();

  constructor(
    private payload: Payload,
    private req: PayloadRequest
  ) {}

  /** Upload one legacy image as Media, once per distinct URL. */
  async image(url: unknown, alt: string): Promise<number | null> {
    if (typeof url !== "string" || !url.trim()) return null;
    const resolved = resolveLegacyUrl(url.trim());
    const cached = this.mediaByUrl.get(resolved);
    if (cached) return cached;

    const res = await fetch(resolved, { signal: AbortSignal.timeout(60_000) });
    if (!res.ok) throw new Error(`Image download failed (${res.status}): ${resolved}`);
    const data = Buffer.from(await res.arrayBuffer());

    // Old upload keys are `YYYY/<uuid>-<name>`; Media adds its own random prefix
    const name = decodeURIComponent(path.posix.basename(new URL(resolved).pathname)).replace(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}-/i,
      ""
    );
    const headerType = res.headers.get("content-type")?.split(";")[0].trim();
    const mimetype =
      headerType && headerType.startsWith("image/")
        ? headerType
        : EXTENSION_MIME[path.extname(name).toLowerCase()] ?? "application/octet-stream";

    const doc = await this.payload.create({
      collection: "media",
      data: { alt },
      file: { data, mimetype, name, size: data.length },
      req: this.req,
    });
    // The Local API leaves the file on the shared request; don't let it leak into the next create
    this.req.file = undefined;

    this.mediaByUrl.set(resolved, doc.id);
    console.log(`  media  ${name}`);
    return doc.id;
  }

  async required(url: unknown, alt: string, what: string): Promise<number> {
    const id = await this.image(url, alt);
    if (id == null) throw new Error(`${what} has no image`);
    return id;
  }
}

async function main() {
  if (!legacyUrl) throw new Error("LEGACY_DATABASE_URL is not set");
  if (!assetBaseUrl) throw new Error("NEXT_PUBLIC_ASSET_BASE_URL is not set");

  const payload = await getPayload({ config });

  for (const collection of ["products", "categories", "blog-posts", "gallery-images"] as const) {
    const { totalDocs } = await payload.count({ collection });
    if (totalDocs > 0) {
      throw new Error(
        `Payload already has ${totalDocs} ${collection}. This import only runs into an empty database.`
      );
    }
  }

  const legacy = new pg.Client({ connectionString: legacyUrl });
  await legacy.connect();
  const rows = async (sql: string) => (await legacy.query<Row>(sql)).rows;

  const req = await createLocalReq({}, payload);
  await initTransaction(req);
  const media = new Importer(payload, req);
  const newPasswords: { email: string; password: string }[] = [];

  try {
    // ---- Categories ----
    console.log("Categories");
    const categoryIds = new Map<string, number>();
    for (const r of await rows(`SELECT * FROM categories ORDER BY sort_order ASC, created_at DESC`)) {
      const name = String(r.name);
      const doc = await payload.create({
        collection: "categories",
        data: { name, image: await media.required(r.image, name, `Category "${name}"`) },
        req,
      });
      categoryIds.set(String(r.id), doc.id);
    }

    // ---- Products ----
    console.log("Products");
    for (const r of await rows(`SELECT * FROM products ORDER BY sort_order ASC, created_at DESC`)) {
      const name = String(r.name);
      const sideImages: number[] = [];
      for (const url of (r.side_images as string[]) ?? []) {
        const id = await media.image(url, name);
        if (id != null) sideImages.push(id);
      }
      const sizeUnit = SIZE_UNITS.find((u) => u === r.size_unit) ?? null;
      await payload.create({
        collection: "products",
        data: {
          name,
          price: Number(r.price),
          currency: String(r.currency),
          sizeValue: sizeUnit && r.size_value != null ? Number(r.size_value) : null,
          sizeUnit: r.size_value != null ? sizeUnit : null,
          rating: Number(r.rating),
          reviewCount: Number(r.review_count),
          image: await media.required(r.image, name, `Product "${name}"`),
          sideImages,
          description: (r.description as string | null) ?? null,
          tags: (r.tags as string[]) ?? [],
          isBestSeller: Boolean(r.is_best_seller),
          category: r.category_id ? categoryIds.get(String(r.category_id)) ?? null : null,
          legacyId: String(r.id),
        },
        req,
      });
      console.log(`  ${name}`);
    }

    // ---- Gallery ----
    console.log("Gallery");
    for (const r of await rows(`SELECT * FROM gallery_images ORDER BY sort_order ASC, created_at DESC`)) {
      const alt = String(r.alt ?? "");
      const span = r.span === "tall" || r.span === "wide" ? r.span : null;
      await payload.create({
        collection: "gallery-images",
        data: {
          image: await media.required(r.image, alt, `Gallery image ${r.id}`),
          alt,
          tags: (r.tags as string[]) ?? [],
          span,
        },
        req,
      });
    }

    // ---- Testimonials ----
    console.log("Testimonials");
    for (const r of await rows(`SELECT * FROM testimonials ORDER BY sort_order ASC, created_at DESC`)) {
      await payload.create({
        collection: "testimonials",
        data: {
          quote: String(r.quote),
          author: String(r.author),
          location: String(r.location),
          rating: Number(r.rating),
          imageA: await media.image(r.image_a, ""),
          imageB: await media.image(r.image_b, ""),
        },
        req,
      });
    }

    // ---- Outlets ----
    console.log("Outlets");
    for (const r of await rows(`SELECT * FROM outlets ORDER BY sort_order ASC, created_at DESC`)) {
      const name = String(r.name);
      await payload.create({
        collection: "outlets",
        data: {
          name,
          address: String(r.address),
          phone: String(r.phone),
          description: String(r.description),
          image: await media.required(r.image, name, `Outlet "${name}"`),
        },
        req,
      });
    }

    // ---- Blog ----
    console.log("Blog");
    const blogCategoryIds = new Map<string, number>();
    for (const r of await rows(`SELECT * FROM blog_categories ORDER BY sort_order ASC, created_at DESC`)) {
      const doc = await payload.create({ collection: "blog-categories", data: { name: String(r.name) }, req });
      blogCategoryIds.set(String(r.id), doc.id);
    }

    const contentField = payload.collections["blog-posts"].config.fields.find(
      (f): f is RichTextField => "name" in f && f.name === "content"
    );
    if (!contentField) throw new Error("blog-posts has no content field");
    const editorConfig = editorConfigFactory.fromField({ field: contentField });

    for (const r of await rows(`SELECT * FROM blog_posts ORDER BY sort_order ASC, published_at DESC`)) {
      const title = String(r.title);
      await payload.create({
        collection: "blog-posts",
        data: {
          title,
          slug: String(r.slug),
          excerpt: String(r.excerpt),
          content: convertHTMLToLexical({ editorConfig, html: String(r.content), JSDOM }),
          coverImage: await media.required(r.cover_image, title, `Blog post "${title}"`),
          category: r.category_id ? blogCategoryIds.get(String(r.category_id)) ?? null : null,
          isFeatured: Boolean(r.is_featured),
          publishedAt: new Date(r.published_at as string | Date).toISOString(),
        },
        req,
      });
      console.log(`  ${title}`);
    }

    // ---- Site-wide content ----
    console.log("Globals");
    const singletons = new Map(
      (await rows(`SELECT key, data FROM singletons`)).map((r) => [String(r.key), r.data as Row])
    );

    const announcement = singletons.get("announcement");
    const messages = ((announcement?.messages as unknown[]) ?? []).filter(
      (m): m is string => typeof m === "string" && m.trim() !== ""
    );
    await payload.updateGlobal({
      slug: "announcement",
      data: { messages: messages.map((text) => ({ text })) },
      req,
    });

    const footer = singletons.get("footer");
    const social = ((footer?.social as { label?: string; href?: string }[]) ?? []).flatMap((s) => {
      const platform = SOCIAL_PLATFORMS.find((p) => p === s.label);
      return platform && s.href?.trim() ? [{ platform, url: s.href.trim() }] : [];
    });
    await payload.updateGlobal({ slug: "footer", data: { social }, req });

    const banner = singletons.get("giftSetsBanner");
    if (banner?.heading && banner.image) {
      const heading = String(banner.heading);
      await payload.updateGlobal({
        slug: "gift-sets-banner",
        data: {
          eyebrow: String(banner.eyebrow ?? ""),
          heading,
          body: String(banner.body ?? ""),
          image: await media.required(banner.image, heading, "Gift sets banner"),
          ctaLabel: String(banner.ctaLabel ?? ""),
          ctaHref: String(banner.ctaHref ?? ""),
        },
        req,
      });
    } else {
      console.log("  gift sets banner has no heading/image in the old database; left empty");
    }
    console.log("  hero and Our Story skipped: the site keeps its built-in copy until they are edited");

    // ---- Admin accounts ----
    console.log("Admins");
    for (const r of await rows(`SELECT email FROM admin_users ORDER BY created_at ASC`)) {
      const email = String(r.email).toLowerCase();
      const { totalDocs } = await payload.count({ collection: "users", where: { email: { equals: email } }, req });
      if (totalDocs > 0) {
        console.log(`  ${email} already exists; left as is`);
        continue;
      }
      const password = randomBytes(12).toString("base64url");
      await payload.create({ collection: "users", data: { email, password }, req });
      newPasswords.push({ email, password });
    }

    await commitTransaction(req);
  } catch (error) {
    await killTransaction(req);
    throw error;
  } finally {
    await legacy.end();
  }

  console.log("\nImport finished.");
  if (newPasswords.length > 0) {
    console.log("\nNew admin passwords (shown once, change them under Users after logging in):");
    for (const { email, password } of newPasswords) console.log(`  ${email}  ${password}`);
  }
}

// Top-level await: `payload run` calls process.exit() as soon as this module finishes loading.
try {
  await main();
  process.exit(0);
} catch (error) {
  console.error("\nImport failed, nothing was written to the Payload database.\n", error);
  process.exit(1);
}
