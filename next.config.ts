import type { NextConfig } from "next";

/**
 * Images live in two places and both must be optimizable:
 *
 *  - `public/images/hero|story/**` — shipped with the build, referenced by path
 *  - everything else — uploaded through the admin and served from Garage's
 *    public web endpoint (`NEXT_PUBLIC_ASSET_BASE_URL`)
 *
 * The optimizer refuses any remote host that isn't listed here, so a missing
 * asset base URL means every admin-uploaded image 400s. That used to be masked
 * by `unoptimized: true`; now it has to fail loudly at build time instead of
 * silently shipping a site with no product photos.
 */
const assetBaseUrl = process.env.NEXT_PUBLIC_ASSET_BASE_URL;

if (!assetBaseUrl && process.env.NODE_ENV === "production") {
  throw new Error(
    "NEXT_PUBLIC_ASSET_BASE_URL is required for production builds — " +
      "images.remotePatterns is derived from it and remote images are blocked without it."
  );
}

const assetUrl = assetBaseUrl ? new URL(assetBaseUrl) : undefined;

const nextConfig: NextConfig = {
  images: {
    remotePatterns: assetUrl
      ? [
          {
            protocol: assetUrl.protocol.replace(":", "") as "https" | "http",
            hostname: assetUrl.hostname,
            pathname: "/**",
          },
        ]
      : [],

    // AVIF first, WebP as the fallback for browsers that don't take it. Both
    // are tried before the original: these are photographic product shots and
    // 1024x1024 PNGs, which is the worst possible pairing of format and content.
    formats: ["image/avif", "image/webp"],

    // Tailwind v4 defaults (sm 640 / md 768 / lg 1024), plus the DPR-2 widths
    // the 1400px content column actually needs. 3840 is dropped: the widest
    // source in the project is the 2560px hero, and Next never upscales, so
    // that entry only ever produced a duplicate transformation of 2048.
    deviceSizes: [640, 750, 828, 1080, 1200, 1440, 1920, 2048],

    // Widths for `sizes` values below the smallest breakpoint — the fixed-size
    // images in the app are 40 (trust badges), 64 (gallery thumbs), 160 (logo),
    // 200 (testimonials), 260 (outlet cards) and 320 (divider).
    imageSizes: [16, 32, 48, 64, 96, 128, 160, 256, 320, 384],

    // Upload keys are `YYYY/<uuid>-<name>` and never rewritten, so an optimized
    // variant can be held for as long as the CDN will hold it. See the note in
    // README about re-deploying changed `public/` images.
    minimumCacheTTL: 31536000,

    // SVGs are only ever author-supplied here (public/*.svg); keep the
    // optimizer's default refusal to process remote SVG in place.
    dangerouslyAllowSVG: false,
  },
};

export default nextConfig;
