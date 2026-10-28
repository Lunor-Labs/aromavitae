import { NextResponse, type NextRequest } from "next/server";

/**
 * One codebase, two deployments:
 *
 *  - Vercel serves the storefront and reads content from the CMS over HTTP.
 *    `CMS_URL` is set there, so `/admin` and `/api` are sent across to it.
 *  - The VPS (Coolify) serves the Payload admin and API. `SITE_URL` is set
 *    there, so storefront pages are sent back to the public site.
 *
 * Never set both on one deployment. With neither (local dev), nothing redirects.
 */
const isCmsPath = (pathname: string) => /^\/(admin|api)(\/|$)/.test(pathname);

export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const target = isCmsPath(pathname) ? process.env.CMS_URL : process.env.SITE_URL;
  if (!target) return NextResponse.next();
  return NextResponse.redirect(new URL(pathname + search, target));
}

export const config = {
  // Build output, the image optimizer and anything with a file extension
  // (icons, public/ images) are served wherever they are requested.
  matcher: ["/((?!_next/|.*\\.[a-zA-Z0-9]+$).*)"],
};
