"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { preloadImage } from "@/lib/preloadImage";

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
 * Every slide past the first is downloaded and decoded in the background before
 * it is allowed onto the track, and the rotation waits on any slide that isn't
 * ready yet — so a slide never animates in over an empty frame.
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
  // Slides whose bytes are cached *and* decoded, keyed by src — so the duplicate
  // wrap-around slide is covered by the real first slide for free.
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

  // Warm the whole set into cache in the background as soon as the card
  // hydrates, long before any of them is due on screen.
  useEffect(() => {
    if (!imagesKey) return;
    let cancelled = false;

    for (const src of imagesKey.split("\n")) {
      preloadImage(src).then(() => {
        if (cancelled) return;
        setReady((prev) => (prev.has(src) ? prev : new Set(prev).add(src)));
      });
    }

    return () => {
      cancelled = true;
    };
  }, [imagesKey]);

  useEffect(() => {
    if (count <= 1) return;
    const timer = setInterval(() => {
      const t = trackRef.current;
      // Mid wrap-around — the reset effect below owns this step.
      if (t >= count) return;
      // Next slide isn't cached yet: stay put and try again on the next tick.
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
    <div
      className={`absolute top-0 left-0 h-full flex will-change-transform ${
        animated ? "transition-transform duration-700 ease-in-out" : ""
      }`}
      style={{ transform: `translateX(-${track * 100}%)`, width: `${slides.length * 100}%` }}
    >
      {slides.map((src, i) => (
        <div key={`${src}-${i}`} className="relative h-full shrink-0" style={{ width: `${100 / slides.length}%` }}>
          {/* The first slide is on screen from the start, so it loads on the
              browser's normal terms. The rest are mounted only once cached,
              which makes their `eager` load a no-op that paints immediately. */}
          {(i === 0 || ready.has(src)) && (
            <Image
              src={src}
              alt={alt}
              fill
              sizes={sizes}
              className={className}
              loading={i === 0 ? undefined : "eager"}
            />
          )}
        </div>
      ))}
    </div>
  );
}
