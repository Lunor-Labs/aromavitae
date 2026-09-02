"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { preloadImage } from "@/lib/preloadImage";
import { fillImageCandidates } from "@/lib/imageCandidates";
import { cn } from "@/lib/utils";

interface Props {
  images: string[];
  alt: string;
}

const SWIPE_THRESHOLD_PX = 50;
const SLIDE_DURATION_MS = 700;
const AUTO_ADVANCE_MS = 4000;
// The main frame spans the viewport up to `lg`, then half of the two-column
// product layout. Shared by the rendered <Image> and the cache warm-up below,
// which have to resolve to the same optimized URL to be a cache hit.
const FRAME_SIZES = "(max-width: 1024px) 100vw, 50vw";

/**
 * AliExpress-style gallery: a large sliding frame plus a thumbnail strip.
 *
 * The frame is the same carousel the product cards use — it slides on a timer,
 * wraps endlessly, and refuses to advance onto a shot that hasn't decoded yet —
 * with arrows, thumbnails and touch swipe layered on for manual control.
 */
export function ProductImageGallery({ images, alt }: Props) {
  const list = images.filter(Boolean);
  const count = list.length;

  // `track` may sit one past the last real slide, on a duplicate of the first
  // image, so wrapping never has to animate backwards through the whole strip.
  const [track, setTrack] = useState(0);
  const [animated, setAnimated] = useState(true);
  // Shots whose bytes are cached *and* decoded, so showing one is instant.
  const [ready, setReady] = useState<ReadonlySet<string>>(() => new Set());

  const slides = count > 0 ? [...list, list[0]] : [];
  // Which thumbnail is lit — the tail duplicate is the first image again.
  const active = count > 0 ? track % count : 0;
  const nextSrc = count > 0 ? list[(track + 1) % count] : undefined;
  // Depend on the image list by value; the array itself is new every render.
  const imagesKey = list.join("\n");

  const touchStartX = useRef<number | null>(null);

  // Pull every shot into cache up front, so arrows and thumbnails respond
  // immediately instead of starting a download on click. Strictly one at a
  // time and in display order: fetching them all at once would have the side
  // shots competing with the main image for the same few connections.
  useEffect(() => {
    if (!imagesKey) return;
    let cancelled = false;

    let chain = Promise.resolve();
    imagesKey.split("\n").forEach((src) => {
      chain = chain
        .then(() => {
          if (cancelled) return undefined;
          const candidates = fillImageCandidates(src, FRAME_SIZES);
          return preloadImage(candidates.src, candidates);
        })
        .then(() => {
          if (cancelled) return;
          setReady((prev) => (prev.has(src) ? prev : new Set(prev).add(src)));
        });
    });

    return () => {
      cancelled = true;
    };
  }, [imagesKey]);

  // Auto-advance. Re-armed whenever `track` changes, so a manual move also
  // resets the countdown, and whenever `ready` grows, which is how a slide that
  // wasn't decoded in time gets its turn once it finally is.
  useEffect(() => {
    // Mid wrap-around — the reset effect below owns that step.
    if (count <= 1 || track >= count) return;
    if (!nextSrc || !ready.has(nextSrc)) return;
    const id = setTimeout(() => {
      setAnimated(true);
      setTrack(track + 1);
    }, AUTO_ADVANCE_MS);
    return () => clearTimeout(id);
  }, [track, count, ready, nextSrc]);

  // Endless loop: once the slide onto the duplicate has finished, snap back to
  // the real first slide with the animation off. Same photo, so it's invisible.
  useEffect(() => {
    if (track !== count) return;
    const id = setTimeout(() => {
      setAnimated(false);
      setTrack(0);
    }, SLIDE_DURATION_MS);
    return () => clearTimeout(id);
  }, [track, count]);

  if (count === 0) return null;

  // The queue above walks the strip in order; a shot the user has just asked
  // for outranks the rest of it and gets fetched on the spot.
  const warm = (index: number) => {
    const src = list[index % count];
    if (ready.has(src)) return;
    const candidates = fillImageCandidates(src, FRAME_SIZES);
    preloadImage(candidates.src, candidates).then(() =>
      setReady((prev) => (prev.has(src) ? prev : new Set(prev).add(src)))
    );
  };

  const goTo = (index: number) => {
    warm(index);
    setAnimated(true);
    setTrack(index);
  };

  const goNext = () => {
    // Already wrapping; let that finish rather than stacking another step on it.
    if (track >= count) return;
    warm(track + 1);
    setAnimated(true);
    setTrack(track + 1);
  };

  const goPrev = () => {
    if (track > 0) {
      warm(track - 1);
      setAnimated(true);
      setTrack(track - 1);
      return;
    }
    // On the first slide: hop silently onto the tail duplicate — the same photo,
    // so nothing changes on screen — then slide one step left from there. Two
    // frames' wait so the jump is painted before the transition is switched on,
    // otherwise the browser animates the jump itself.
    warm(count - 1);
    setAnimated(false);
    setTrack(count);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setAnimated(true);
        setTrack(count - 1);
      });
    });
  };

  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const delta = e.changedTouches[0].clientX - touchStartX.current;
    touchStartX.current = null;
    if (Math.abs(delta) < SWIPE_THRESHOLD_PX) return;
    if (delta < 0) goNext();
    else goPrev();
  };

  return (
    <div>
      {/* Main frame */}
      <div
        className="relative aspect-square rounded-lg overflow-hidden bg-cream"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        {/* The track is exactly as wide as the frame and lets its slides
            overflow, rather than being N frames wide: a percentage translate
            resolves against the element's *own* width, so on a wider track one
            step would jump several slides at once. */}
        <div
          className={cn(
            "absolute inset-0 flex will-change-transform",
            animated && "transition-transform duration-700 ease-in-out"
          )}
          style={{ transform: `translateX(-${track * 100}%)` }}
        >
          {slides.map((src, i) => {
            const isReady = ready.has(src);
            return (
              <div
                key={`${src}-${i}`}
                className={cn(
                  "relative h-full w-full shrink-0 transition-opacity duration-500 ease-out",
                  isReady ? "opacity-100" : "opacity-0"
                )}
              >
                {/* The opening shot is on screen from the start, so it loads on
                    the browser's normal terms. The rest are mounted only once
                    cached, which makes their `eager` load a cache hit that
                    paints immediately. */}
                {(i === 0 || isReady) && (
                  <Image
                    src={src}
                    alt={alt}
                    fill
                    priority={i === 0}
                    loading={i === 0 ? undefined : "eager"}
                    className="object-cover"
                    sizes={FRAME_SIZES}
                    onLoad={() =>
                      setReady((prev) => (prev.has(src) ? prev : new Set(prev).add(src)))
                    }
                  />
                )}
              </div>
            );
          })}
        </div>

        {count > 1 && (
          <>
            <button
              onClick={goPrev}
              aria-label="Previous image"
              className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-warm-white/80
                         flex items-center justify-center text-forest hover:bg-warm-white transition-colors z-10"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={goNext}
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

      {/* Thumbnails. The selected one wears a ring that is drawn *outside* its
          box, so the strip needs a pixel of room on every side — without it the
          scroll container clips the ring against the edge of the main image.
          The negative margin cancels that padding so the strip still lines up
          with the frame above. */}
      {count > 1 && (
        <div className="flex gap-2 mt-2 -mx-1 px-1 py-1 overflow-x-auto scrollbar-hide">
          {list.map((src, i) => (
            <button
              key={`${src}-${i}`}
              onClick={() => goTo(i)}
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
