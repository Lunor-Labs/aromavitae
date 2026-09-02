import Image from "next/image";
import { STORAGE_BASE_URL } from "@/lib/storage";

interface Props {
  src: string;
  /** Rendered size in CSS pixels — square. */
  size: number;
  className?: string;
  alt?: string;
}

function stripQuery(src: string): string {
  return src.split("?")[0].split("#")[0];
}

/**
 * Can the image optimizer be pointed at this URL?
 *
 * The admin's image fields double as a paste-a-URL box, so a row can hold a
 * host that isn't in `images.remotePatterns`. `next/image` throws on those
 * rather than degrading, which would take out the whole list page, so anything
 * off the asset host falls back to a plain `<img>`.
 *
 * SVG is excluded for the same reason: the optimizer 400s on it while
 * `dangerouslyAllowSVG` is off. New SVG uploads are rejected by the API, but a
 * row predating that rule would otherwise render as a broken thumbnail.
 */
function isOptimizable(src: string): boolean {
  if (stripQuery(src).toLowerCase().endsWith(".svg")) return false;
  if (src.startsWith("/")) return true;
  if (!STORAGE_BASE_URL) return false;
  try {
    return new URL(src).origin === new URL(STORAGE_BASE_URL).origin;
  } catch {
    return false;
  }
}

/**
 * Row thumbnail for the admin list pages.
 *
 * These are 40px squares that were being filled with the full-size original —
 * the product shots alone are ~600KB 1024x1024 PNGs, so a 20-row list pulled
 * something like 12MB to draw a strip of icons. Routing them through the
 * optimizer asks for a 48px AVIF instead, roughly a thousandth of that.
 */
export function AdminThumb({ src, size, className = "", alt = "" }: Props) {
  if (!src) return null;

  if (!isOptimizable(src)) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt={alt} className={className} loading="lazy" />;
  }

  return (
    <Image
      src={src}
      alt={alt}
      width={size}
      height={size}
      className={className}
      // A fixed-size thumbnail: `sizes` keeps the optimizer from handing out a
      // device-width variant for a box this small.
      sizes={`${size}px`}
    />
  );
}
