import { timingSafeEqual } from "node:crypto";
import type { PayloadRequest } from "payload";

export type ShopMode = "off" | "test" | "live";

/** Sent by the storefront, from the cookie the preview link sets. */
export const PREVIEW_KEY_HEADER = "x-shop-preview-key";

function matchesPreviewKey(req: PayloadRequest): boolean {
  const expected = process.env.SHOP_PREVIEW_KEY;
  const given = req.headers.get(PREVIEW_KEY_HEADER);
  if (!expected || !given) return false;
  const a = Buffer.from(expected);
  const b = Buffer.from(given);
  return a.length === b.length && timingSafeEqual(a, b);
}

export interface ShopAccess {
  mode: ShopMode;
  /** Whether this caller may use the shop right now. */
  open: boolean;
  previewOk: boolean;
}

export async function getShopAccess(req: PayloadRequest): Promise<ShopAccess> {
  const settings = await req.payload.findGlobal({ slug: "shop-settings", req, overrideAccess: true });
  const mode = settings.mode ?? "off";
  const previewOk = matchesPreviewKey(req);
  return { mode, previewOk, open: mode === "live" || (mode === "test" && previewOk) };
}
