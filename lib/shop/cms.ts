import { cookies } from "next/headers";
import { cmsUrl } from "@/lib/content";

/**
 * The storefront's write side. Calls go from Vercel to the CMS, server to
 * server: the two are on different domains, so the browser can't share a cookie
 * with the CMS, and `proxy.ts` sends `/api` on the site across to it anyway.
 *
 * Nothing here is cached. Prices, stock and orders are always read fresh.
 */

/** Holds the preview key in `test` mode; only ever sent on to the CMS. */
export const PREVIEW_COOKIE = "av_preview";
/** Readable by the browser, so the shop UI knows to appear. Grants nothing itself. */
export const PREVIEW_FLAG_COOKIE = "av_preview_on";
/** The customer's Payload JWT. */
export const SESSION_COOKIE = "av_session";

export type CmsResult<T> = { ok: true; data: T } | { ok: false; status: number; message: string };

interface CmsOptions {
  method?: "GET" | "POST" | "PATCH";
  body?: unknown;
}

/** Payload's own errors come back as `{ errors: [{ message }] }`, ours as `{ message }`. */
function errorMessage(json: unknown): string {
  const body = json as { message?: string; errors?: { message?: string }[] } | null;
  return body?.message ?? body?.errors?.[0]?.message ?? "Something went wrong. Please try again.";
}

export async function cmsFetch<T>(path: string, { method = "GET", body }: CmsOptions = {}): Promise<CmsResult<T>> {
  const jar = await cookies();
  const headers: Record<string, string> = {};
  if (body !== undefined) headers["Content-Type"] = "application/json";

  const preview = jar.get(PREVIEW_COOKIE)?.value;
  if (preview) headers["x-shop-preview-key"] = preview;
  const session = jar.get(SESSION_COOKIE)?.value;
  if (session) headers.Authorization = `JWT ${session}`;

  let res: Response;
  try {
    res = await fetch(`${cmsUrl()}/api/${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
      cache: "no-store",
    });
  } catch {
    return { ok: false, status: 503, message: "We couldn't reach the shop just now. Please try again." };
  }

  const json: unknown = await res.json().catch(() => null);
  if (!res.ok) return { ok: false, status: res.status, message: errorMessage(json) };
  return { ok: true, data: json as T };
}

/** For pages that only exist while the shop is open to this visitor. */
export async function isShopOpen(): Promise<boolean> {
  const status = await cmsFetch<{ open: boolean }>("shop/status");
  return status.ok && status.data.open;
}
