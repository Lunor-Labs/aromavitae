/**
 * Supabase Storage URL helper.
 *
 * All static asset references should use `assetUrl()` so the base URL
 * is defined in a single place and is easy to change.
 */

const SUPABASE_PROJECT_REF = "edddprzxjdbobdtvbmaj";
const BUCKET = "aromavitae";

export const STORAGE_BASE_URL =
  `https://${SUPABASE_PROJECT_REF}.supabase.co/storage/v1/object/public/${BUCKET}`;

/**
 * Build a full public URL for an asset stored in Supabase Storage.
 *
 * @example assetUrl("products/cinnamon.png")
 * // => "https://edddprzxjdbobdtvbmaj.supabase.co/storage/v1/object/public/aromavitae/products/cinnamon.png"
 */
export function assetUrl(path: string): string {
  return `${STORAGE_BASE_URL}/${path.replace(/^\/+/, "")}`;
}
