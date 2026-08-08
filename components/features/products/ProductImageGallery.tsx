"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface Props {
  images: string[];
  alt: string;
}

const SWIPE_THRESHOLD_PX = 50;

/** AliExpress-style gallery: large main frame + thumbnail strip, arrows and touch swipe. */
export function ProductImageGallery({ images, alt }: Props) {
  const list = images.filter(Boolean);
  const [active, setActive] = useState(0);
  const touchStartX = useRef<number | null>(null);

  if (list.length === 0) return null;

  const go = (next: number) => setActive((next + list.length) % list.length);

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
        {list.map((src, i) => (
          <Image
            key={`${src}-${i}`}
            src={src}
            alt={alt}
            fill
            priority={i === 0}
            className={cn(
              "object-cover transition-opacity duration-500",
              i === active ? "opacity-100" : "opacity-0"
            )}
            sizes="(max-width: 1024px) 100vw, 50vw"
          />
        ))}

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
              onClick={() => setActive(i)}
              aria-label={`View image ${i + 1}`}
              className={cn(
                "relative w-16 h-16 shrink-0 rounded overflow-hidden bg-cream transition-all duration-200",
                i === active ? "ring-2 ring-forest ring-offset-1" : "opacity-70 hover:opacity-100"
              )}
            >
              <Image src={src} alt="" fill className="object-cover" sizes="64px" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
