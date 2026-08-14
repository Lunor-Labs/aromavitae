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

/**
 * A browser only opens a handful of connections per host, so speculative
 * downloads are not free: a page full of carousels that each prefetch their
 * whole set will push the images the user is actually looking at to the back
 * of the queue. Prefetches therefore wait for the page to finish loading and
 * then run a few at a time.
 */
const MAX_CONCURRENT_PREFETCH = 3;

let inFlight = 0;
const waiting: Array<() => void> = [];

function pump() {
  while (inFlight < MAX_CONCURRENT_PREFETCH && waiting.length > 0) {
    const start = waiting.shift();
    if (!start) return;
    inFlight += 1;
    start();
  }
}

/** Resolves once every image already in the document has finished loading. */
function afterPageLoad(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if (document.readyState === "complete") return Promise.resolve();
  return new Promise<void>((resolve) => {
    window.addEventListener("load", () => resolve(), { once: true });
  });
}

/**
 * Same guarantee as {@link preloadImage} — resolves only once the image is
 * cached and decoded — but yields to anything the user can currently see.
 *
 * Use this for images that are not on screen yet (upcoming carousel slides).
 * Use `preloadImage` directly when the user has already asked for the image.
 */
export function prefetchImage(src: string): Promise<void> {
  if (typeof window === "undefined" || !src) return Promise.resolve();

  return afterPageLoad().then(
    () =>
      new Promise<void>((resolve) => {
        waiting.push(() => {
          // `preloadImage` never rejects, so the slot is always given back.
          preloadImage(src).then(() => {
            inFlight -= 1;
            pump();
            resolve();
          });
        });
        pump();
      })
  );
}
