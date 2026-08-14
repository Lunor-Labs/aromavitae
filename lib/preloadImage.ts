/**
 * Fetches an image into the browser cache and forces it to decode, resolving
 * only once it can be painted in the very next frame.
 *
 * An `<img onLoad>` handler is not enough on its own: `load` fires when the
 * bytes have arrived, but a large photo still has to be decoded before it can
 * be drawn. That decode is the blank gap you see when a carousel slides an
 * image in at the same moment it finishes downloading.
 *
 * Deliberately does not set `crossOrigin` — a CORS request would be a separate
 * cache entry from the plain `<img>` the carousel renders, defeating the point.
 *
 * Resolves (never rejects) on failure, so one broken URL can't permanently
 * stall a carousel that is waiting on it.
 */
export function preloadImage(src: string): Promise<void> {
  if (typeof window === "undefined" || !src) return Promise.resolve();

  return new Promise<void>((resolve) => {
    const img = new window.Image();

    const decodeThenResolve = () => {
      const decoded = typeof img.decode === "function" ? img.decode() : Promise.resolve();
      decoded.then(() => resolve(), () => resolve());
    };

    img.onload = decodeThenResolve;
    img.onerror = () => resolve();
    img.src = src;

    // An already-cached image can be complete before the handlers above ever
    // get a chance to fire.
    if (img.complete) decodeThenResolve();
  });
}
