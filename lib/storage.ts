/**
 * Object storage URL helper.
 *
 * All static asset references should use `assetUrl()` so the base URL
 * is defined in a single place and is easy to change.
 */

export const STORAGE_BASE_URL = process.env.NEXT_PUBLIC_ASSET_BASE_URL ?? "";

/**
 * Build a full public URL for an asset stored in object storage.
 *
 * @example assetUrl("products/cinnamon.png")
 * // => "https://<bucket-public-url>/products/cinnamon.png"
 */
export function assetUrl(path: string): string {
  return `${STORAGE_BASE_URL}/${path.replace(/^\/+/, "")}`;
}
