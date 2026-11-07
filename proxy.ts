import { NextResponse, type NextRequest } from "next/server";
import { COUNTRY_COOKIE, CURRENCY_COOKIE, currencyForCountry } from "@/lib/shop/money";

/**
 * One codebase, two deployments:
 *
 *  - Vercel serves the storefront and reads content from the CMS over HTTP.
 *    `CMS_URL` is set there, so `/admin` and `/api` are sent across to it.
 *  - The VPS (Coolify) serves the Payload admin and API. `SITE_URL` is set
 *    there, so storefront pages are sent back to the public site. The one
 *    exception is its root, which opens the admin so nobody has to type `/admin`.
 *
 * Never set both on one deployment. With neither (local dev), nothing redirects.
 *
 * Pages are cached for everyone, so a first-time visitor's currency is decided
 * here, from the country Vercel reports, and left in a cookie for the browser.
 */
const ONE_YEAR = 60 * 60 * 24 * 365;

const isCmsPath = (pathname: string) => /^\/(admin|api)(\/|$)/.test(pathname);

export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  if (pathname === "/" && process.env.SITE_URL) {
    const adminUrl = request.nextUrl.clone();
    adminUrl.pathname = "/admin";
    return NextResponse.redirect(adminUrl);
  }

  const target = isCmsPath(pathname) ? process.env.CMS_URL : process.env.SITE_URL;
  if (!target) {
    const response = NextResponse.next();
    const country = request.headers.get("x-vercel-ip-country");
    if (country && !request.cookies.has(COUNTRY_COOKIE)) {
      const options = { maxAge: ONE_YEAR, sameSite: "lax", path: "/" } as const;
      response.cookies.set(COUNTRY_COOKIE, country, options);
      if (!request.cookies.has(CURRENCY_COOKIE)) {
        response.cookies.set(CURRENCY_COOKIE, currencyForCountry(country), options);
      }
    }
    return response;
  }
  return NextResponse.redirect(new URL(pathname + search, target));
}

export const config = {
  // Build output, the image optimizer and anything with a file extension
  // (icons, public/ images) are served wherever they are requested.
  matcher: ["/((?!_next/|.*\\.[a-zA-Z0-9]+$).*)"],
};
