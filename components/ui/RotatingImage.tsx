"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";

interface RotatingImageProps {
  images: string[];
  alt: string;
  sizes?: string;
  intervalMs?: number;
  className?: string;
}

const SLIDE_DURATION_MS = 700;
// Off-screen slides start downloading this long after mount — late enough to
// stay out of the page's initial load burst, far earlier than the first slide.
const PREFETCH_DELAY_MS = 300;

/**
 * Slides between a set of images on a timer, like a carousel track. The parent
 * supplies the positioned container (e.g. `relative aspect-[4/5]`), matching how
 * a single `next/image fill` would be used.
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
  // Slides past the first sit outside the visible frame, so next/image would
  // lazy-load them and only start the download as they slide in — that's the
  // grey box. Flipping them to eager after hydration downloads them up front
  // without competing with the page's own initial load.
  const [prefetch, setPrefetch] = useState(false);

  const slides = count > 0 ? [...list, list[0]] : [];

  // Mirrored into refs (from effects, never during render) so the interval can
  // read the latest values without being torn down and re-armed every tick.
  // Loaded slides are keyed by src, so the duplicated wrap-around slide is
  // covered by the real one for free.
  const loadedRef = useRef<Set<string>>(new Set());
  const trackRef = useRef(0);
  const slidesRef = useRef<string[]>(slides);

  // An image that fails still counts as "settled", otherwise one broken URL
  // would stall the rotation permanently.
  const markSettled = useCallback((src: string) => {
    loadedRef.current.add(src);
  }, []);

  useEffect(() => {
    trackRef.current = track;
  }, [track]);

  useEffect(() => {
    slidesRef.current = slides;
  });

  useEffect(() => {
    const id = window.setTimeout(() => setPrefetch(true), PREFETCH_DELAY_MS);
    return () => window.clearTimeout(id);
  }, []);

  useEffect(() => {
    if (count <= 1) return;
    const timer = setInterval(() => {
      const t = trackRef.current;
      // Mid wrap-around — the reset effect below owns this step.
      if (t >= count) return;
      // Hold on the current slide until the next one has actually decoded.
      if (!loadedRef.current.has(slidesRef.current[t + 1])) return;
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
    <div
      className={`absolute top-0 left-0 h-full flex will-change-transform ${
        animated ? "transition-transform duration-700 ease-in-out" : ""
      }`}
      style={{ transform: `translateX(-${track * 100}%)`, width: `${slides.length * 100}%` }}
    >
      {slides.map((src, i) => (
        <div key={`${src}-${i}`} className="relative h-full shrink-0" style={{ width: `${100 / slides.length}%` }}>
          <Image
            src={src}
            alt={alt}
            fill
            sizes={sizes}
            className={className}
            loading={i === 0 || prefetch ? "eager" : "lazy"}
            onLoad={() => markSettled(src)}
            onError={() => markSettled(src)}
          />
        </div>
      ))}
    </div>
  );
}
