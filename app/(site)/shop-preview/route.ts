import { NextResponse, type NextRequest } from "next/server";
import { cmsUrl } from "@/lib/content";
import { PREVIEW_COOKIE, PREVIEW_FLAG_COOKIE } from "@/lib/shop/cms";

const ONE_WEEK = 60 * 60 * 24 * 7;

/**
 * `/shop-preview?key=...` lets one browser use the shop in `test` mode, on the
 * real site, without anyone else seeing it. `?off` ends it. The CMS is the only
 * one that knows the key.
 */
export async function GET(request: NextRequest) {
  const home = new URL("/", request.url);
  const response = NextResponse.redirect(home);

  if (request.nextUrl.searchParams.has("off")) {
    response.cookies.delete(PREVIEW_COOKIE);
    response.cookies.delete(PREVIEW_FLAG_COOKIE);
    return response;
  }

  const key = request.nextUrl.searchParams.get("key") ?? "";
  const check = await fetch(`${cmsUrl()}/api/shop/status`, {
    headers: { "x-shop-preview-key": key },
    cache: "no-store",
  }).catch(() => null);
  const status = (await check?.json().catch(() => null)) as { previewOk?: boolean } | null;
  if (!status?.previewOk) return response;

  const secure = request.nextUrl.protocol === "https:";
  const options = { maxAge: ONE_WEEK, sameSite: "lax", secure, path: "/" } as const;
  response.cookies.set(PREVIEW_COOKIE, key, { ...options, httpOnly: true });
  response.cookies.set(PREVIEW_FLAG_COOKIE, "1", options);
  return response;
}
