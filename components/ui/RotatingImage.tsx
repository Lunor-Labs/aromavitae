"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

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

  useEffect(() => {
    if (count <= 1) return;
    const timer = setInterval(() => {
      setAnimated(true);
      setTrack((t) => t + 1);
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

  const slides = [...list, list[0]];

  return (
    <div
      className={`absolute top-0 left-0 h-full flex will-change-transform ${
        animated ? "transition-transform duration-700 ease-in-out" : ""
      }`}
      style={{ transform: `translateX(-${track * 100}%)`, width: `${slides.length * 100}%` }}
    >
      {slides.map((src, i) => (
        <div key={`${src}-${i}`} className="relative h-full shrink-0" style={{ width: `${100 / slides.length}%` }}>
          <Image src={src} alt={alt} fill sizes={sizes} className={className} />
        </div>
      ))}
    </div>
  );
}
