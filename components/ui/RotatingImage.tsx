"use client";

import Image from "next/image";
import { useAutoRotate } from "@/hooks/useAutoRotate";

interface RotatingImageProps {
  images: string[];
  alt: string;
  sizes?: string;
  intervalMs?: number;
  className?: string;
}

/**
 * Crossfades between a set of images on a timer. The parent supplies the
 * positioned container (e.g. `relative aspect-[4/5]`), matching how a single
 * `next/image fill` would be used.
 */
export function RotatingImage({
  images,
  alt,
  sizes,
  intervalMs = 4000,
  className = "object-cover",
}: RotatingImageProps) {
  const list = images.filter(Boolean);
  const { index } = useAutoRotate(list.length, intervalMs);

  if (list.length === 0) return null;
  if (list.length === 1) {
    return <Image src={list[0]} alt={alt} fill className={className} sizes={sizes} />;
  }

  return (
    <>
      {list.map((src, i) => (
        <Image
          key={`${src}-${i}`}
          src={src}
          alt={alt}
          fill
          sizes={sizes}
          className={`${className} transition-opacity duration-1000 ease-in-out will-change-[opacity] ${
            i === index ? "opacity-100" : "opacity-0"
          }`}
        />
      ))}
    </>
  );
}
