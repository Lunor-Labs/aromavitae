"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { prefetchImage } from "@/lib/preloadImage";
import { fillImageCandidates } from "@/lib/imageCandidates";

interface RotatingImageProps {
  images: string[];
  alt: string;
  sizes?: string;
  intervalMs?: number;
  className?: string;
}

const SLIDE_DURATION_MS = 700;

/**
 * Slides between a set of images on a timer, like a carousel track. The parent
 * supplies the positioned container (e.g. `relative aspect-[4/5]`), matching how
 * a single `next/image fill` would be used.
 *
 * Two rules keep a slide from ever animating in over an empty frame:
 *
 * 1. A slide is fetched and decoded in the background *one step ahead* of when
 *    it is due, and the rotation refuses to advance onto a slide that isn't
 *    ready yet — it just waits and tries again on the next tick.
 * 2. Whatever does appear fades in rather than popping, so the container's own
 *    background is never swapped for a photo mid-slide.
 *
 * Fetching only one slide ahead matters as much as the decode gate: a grid of
 * these would otherwise kick off dozens of full-size downloads on hydration and
 * starve the very first slide of every card.
 */
export function RotatingImage({
  images,
  alt,
  sizes,
  intervalMs = 4000,
  className = "object-cover",
}: RotatingImageProps) {
  const list = images.filter(Boolean);
  const count = list.length;
  // `track` can go one past the last real slide — that step lands on a duplicate
  // of the first image so the slide-back-to-start doesn't have to jump backwards.
  const [track, setTrack] = useState(0);
  const [animated, setAnimated] = useState(true);
  // Slides that are cached, decoded and safe to show, keyed by src — so the
  // duplicate wrap-around slide is covered by the real first slide for free.
  const [ready, setReady] = useState<ReadonlySet<string>>(() => new Set());

  const slides = count > 0 ? [...list, list[0]] : [];
  // Depend on the image list by value; the array itself is new every render.
  const imagesKey = list.join("\n");

  // Mirrored into refs from effects (never during render) so the rotation
  // interval can read current values without being torn down and re-armed.
  const readyRef = useRef<ReadonlySet<string>>(ready);
  const trackRef = useRef(0);
  const slidesRef = useRef<string[]>(slides);

  useEffect(() => {
    readyRef.current = ready;
  }, [ready]);

  useEffect(() => {
    trackRef.current = track;
  }, [track]);

  useEffect(() => {
    slidesRef.current = slides;
  });

  // Warm exactly one slide ahead, and only once the page itself has loaded, so
  // this never competes with the images already on screen.
  useEffect(() => {
    const all = imagesKey ? imagesKey.split("\n") : [];
    if (all.length <= 1) return;

    const nextSrc = all[(track + 1) % all.length];
    let cancelled = false;

    // Warm the same optimized variant the slide's <Image> will request, not the
    // source URL — see `fillImageCandidates`.
    const candidates = fillImageCandidates(nextSrc, sizes);

    prefetchImage(candidates.src, candidates).then(() => {
      if (cancelled) return;
      setReady((prev) => (prev.has(nextSrc) ? prev : new Set(prev).add(nextSrc)));
    });

    return () => {
      cancelled = true;
    };
  }, [imagesKey, track, sizes]);

  useEffect(() => {
    if (count <= 1) return;
    const timer = setInterval(() => {
      const t = trackRef.current;
      // Mid wrap-around — the reset effect below owns this step.
      if (t >= count) return;
      // Next slide isn't decoded yet: stay put and try again on the next tick.
      if (!readyRef.current.has(slidesRef.current[t + 1])) return;
      setAnimated(true);
      setTrack(t + 1);
    }, intervalMs);
    return () => clearInterval(timer);
  }, [count, intervalMs]);

  useEffect(() => {
    if (track !== count) return;
    const id = setTimeout(() => {
      setAnimated(false);
      setTrack(0);
    }, SLIDE_DURATION_MS);
    return () => clearTimeout(id);
  }, [track, count]);

  if (count === 0) return null;
  if (count === 1) {
    return <Image src={list[0]} alt={alt} fill className={className} sizes={sizes} />;
  }

  return (
    // The track is exactly as wide as the frame and lets its slides overflow,
    // rather than being N frames wide. That keeps the maths honest: a percentage
    // translate resolves against the element's *own* width, so on a 300%-wide
    // track `translateX(-100%)` would jump three slides at once, not one.
    <div
      className={`absolute top-0 left-0 h-full w-full flex will-change-transform ${
        animated ? "transition-transform duration-700 ease-in-out" : ""
      }`}
      style={{ transform: `translateX(-${track * 100}%)` }}
    >
      {slides.map((src, i) => {
        const isReady = ready.has(src);
        return (
          <div
            key={`${src}-${i}`}
            // Fade in on the way from container background to photo, the same
            // way the testimonial images do — a half-second ramp reads as
            // deliberate where an instant swap reads as a glitch.
            className={`relative h-full w-full shrink-0 transition-opacity duration-500 ease-out ${
              isReady ? "opacity-100" : "opacity-0"
            }`}
          >
            {/* The first slide is on screen from the start, so it loads on the
                browser's normal terms and reports itself ready via `onLoad`.
                The rest are mounted only once prefetched, which makes their
                `eager` load a cache hit that paints immediately. */}
            {(i === 0 || isReady) && (
              <Image
                src={src}
                alt={alt}
                fill
                sizes={sizes}
                className={className}
                loading={i === 0 ? undefined : "eager"}
                onLoad={() =>
                  setReady((prev) => (prev.has(src) ? prev : new Set(prev).add(src)))
                }
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
