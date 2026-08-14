"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { preloadImage } from "@/lib/preloadImage";
import { cn } from "@/lib/utils";

interface Props {
  images: string[];
  alt: string;
}

const SWIPE_THRESHOLD_PX = 50;

/** AliExpress-style gallery: large main frame + thumbnail strip, arrows and touch swipe. */
export function ProductImageGallery({ images, alt }: Props) {
  const list = images.filter(Boolean);
  // `active` is what the user picked (drives the thumbnail highlight, so the tap
  // feels instant); `visible` is what the frame actually shows. They diverge only
  // while the picked image is still downloading — that way the frame keeps the
  // previous photo up instead of flashing an empty box.
  const [active, setActive] = useState(0);
  const [visible, setVisible] = useState(0);
  // Images whose bytes are cached *and* decoded, so switching to one is instant.
  const [ready, setReady] = useState<ReadonlySet<string>>(() => new Set());
  const touchStartX = useRef<number | null>(null);
  const activeRef = useRef(0);

  // Depend on the image list by value; the array itself is new every render.
  const imagesKey = list.join("\n");

  useEffect(() => {
    activeRef.current = active;
  }, [active]);

  // Pull every shot into cache up front, so arrows and thumbnails respond
  // immediately instead of starting a download on click. Strictly one at a
  // time and in display order: fetching them all at once would have the side
  // shots competing with the main image for the same few connections.
  useEffect(() => {
    if (!imagesKey) return;
    let cancelled = false;

    let chain = Promise.resolve();
    imagesKey.split("\n").forEach((src, index) => {
      chain = chain
        .then(() => (cancelled ? undefined : preloadImage(src)))
        .then(() => {
          if (cancelled) return;
          setReady((prev) => (prev.has(src) ? prev : new Set(prev).add(src)));
          // If this is the shot the user is currently waiting on, reveal it now.
          if (index === activeRef.current) setVisible(index);
        });
    });

    return () => {
      cancelled = true;
    };
  }, [imagesKey]);

  if (list.length === 0) return null;

  // Cached shots swap instantly. Anything the queue above hasn't reached yet
  // gets fetched on the spot rather than waiting its turn — the user asked for
  // this one, so it outranks the rest of the strip.
  const select = (index: number) => {
    const src = list[index];
    setActive(index);
    if (ready.has(src)) {
      setVisible(index);
      return;
    }
    preloadImage(src).then(() => {
      setReady((prev) => (prev.has(src) ? prev : new Set(prev).add(src)));
      if (activeRef.current === index) setVisible(index);
    });
  };

  const go = (next: number) => select((next + list.length) % list.length);

  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const delta = e.changedTouches[0].clientX - touchStartX.current;
    touchStartX.current = null;
    if (Math.abs(delta) < SWIPE_THRESHOLD_PX) return;
    go(delta < 0 ? active + 1 : active - 1);
  };

  return (
    <div>
      {/* Main frame */}
      <div
        className="relative aspect-square rounded-lg overflow-hidden bg-cream"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        {/* Only the opening shot and shots already in cache are mounted —
            mounting them all `eager` would restart the very downloads the
            queue above is trying to order. */}
        {list.map((src, i) =>
          i === 0 || ready.has(src) ? (
            <Image
              key={`${src}-${i}`}
              src={src}
              alt={alt}
              fill
              priority={i === 0}
              loading={i === 0 ? undefined : "eager"}
              className={cn(
                "object-cover transition-opacity duration-700 ease-in-out will-change-[opacity]",
                i === visible ? "opacity-100" : "opacity-0"
              )}
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          ) : null
        )}

        {list.length > 1 && (
          <>
            <button
              onClick={() => go(active - 1)}
              aria-label="Previous image"
              className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-warm-white/80
                         flex items-center justify-center text-forest hover:bg-warm-white transition-colors z-10"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={() => go(active + 1)}
              aria-label="Next image"
              className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-warm-white/80
                         flex items-center justify-center text-forest hover:bg-warm-white transition-colors z-10"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </>
        )}
      </div>

      {/* Thumbnails */}
      {list.length > 1 && (
        <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
          {list.map((src, i) => (
            <button
              key={`${src}-${i}`}
              onClick={() => select(i)}
              aria-label={`View image ${i + 1}`}
              className={cn(
                "relative w-16 h-16 shrink-0 rounded overflow-hidden bg-cream transition-all duration-200",
                i === active ? "ring-2 ring-forest ring-offset-1" : "opacity-70 hover:opacity-100"
              )}
            >
              <Image src={src} alt="" fill className="object-contain" sizes="64px" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
