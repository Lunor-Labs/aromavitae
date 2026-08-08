"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import type { GalleryImage } from "@/types/product";

const ALL = "All";

interface Props {
  images: GalleryImage[];
}

export function GalleryGrid({ images }: Props) {
  const [activeTag, setActiveTag] = useState(ALL);
  const [lightboxImage, setLightboxImage] = useState<GalleryImage | null>(null);

  const tags = useMemo(
    () => [ALL, ...Array.from(new Set(images.flatMap((img) => img.tags))).sort()],
    [images]
  );

  const filteredImages = useMemo(() => {
    if (activeTag === ALL) return images;
    return images.filter((img) => img.tags.includes(activeTag));
  }, [activeTag, images]);

  return (
    <>
      <section className="py-16 md:py-24 bg-warm-white reveal">
        <div className="max-w-[1400px] mx-auto px-6">
          {/* Tag Tabs */}
          <div className="flex flex-wrap justify-center gap-3 mb-12">
            {tags.map((tag) => (
              <button
                key={tag}
                onClick={() => setActiveTag(tag)}
                className={cn(
                  "px-5 py-2.5 text-xs font-medium tracking-[0.15em] rounded-full border transition-all duration-300",
                  activeTag === tag
                    ? "bg-forest text-warm-white border-forest"
                    : "bg-transparent text-charcoal border-border hover:border-forest hover:text-forest"
                )}
              >
                {tag.toUpperCase()}
              </button>
            ))}
          </div>

          {/* Masonry Grid */}
          {filteredImages.length > 0 ? (
            <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4">
              {filteredImages.map((image) => (
                <div
                  key={image.id}
                  className="break-inside-avoid group cursor-pointer"
                  onClick={() => setLightboxImage(image)}
                >
                  <div
                    className={cn(
                      "relative overflow-hidden rounded-lg bg-cream",
                      image.span === "tall"
                        ? "aspect-[3/5]"
                        : image.span === "wide"
                          ? "aspect-[16/9]"
                          : "aspect-[4/5]"
                    )}
                  >
                    <Image
                      src={image.image}
                      alt={image.alt}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-700"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                    {/* Hover overlay */}
                    <div className="absolute inset-0 bg-forest/0 group-hover:bg-forest/40 transition-all duration-500 flex items-end">
                      <div className="w-full p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-500">
                        <p className="text-warm-white text-sm font-medium">
                          {image.alt}
                        </p>
                        <p className="text-gold text-xs tracking-wider mt-1">
                          {image.tags.join(" · ")}
                        </p>
                      </div>
                    </div>
                    {/* Zoom icon */}
                    <div className="absolute top-4 right-4 w-10 h-10 rounded-full bg-warm-white/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 scale-75 group-hover:scale-100">
                      <svg
                        className="w-5 h-5 text-forest"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"
                        />
                      </svg>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <div className="text-4xl mb-4">🌿</div>
              <p className="font-heading text-xl text-charcoal mb-2">
                No images yet
              </p>
              <p className="text-sm text-muted">
                Check back soon for a visual journey through Ceylon&apos;s finest.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Lightbox */}
      {lightboxImage && (
        <div
          className="fixed inset-0 z-[100] bg-charcoal/90 backdrop-blur-sm flex items-center justify-center p-4 md:p-8 animate-fade-in"
          onClick={() => setLightboxImage(null)}
        >
          <button
            className="absolute top-6 right-6 w-10 h-10 rounded-full bg-warm-white/10 flex items-center justify-center text-warm-white hover:bg-warm-white/20 transition-colors"
            onClick={() => setLightboxImage(null)}
            aria-label="Close lightbox"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>

          <div
            className="relative max-w-4xl max-h-[80vh] w-full aspect-[4/3] rounded-lg overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={lightboxImage.image}
              alt={lightboxImage.alt}
              fill
              className="object-contain"
              sizes="90vw"
            />
          </div>

          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-center">
            <p className="text-warm-white font-heading text-lg">
              {lightboxImage.alt}
            </p>
            <p className="text-gold text-xs tracking-[0.2em] mt-1">
              {lightboxImage.tags.join(" · ")}
            </p>
          </div>
        </div>
      )}
    </>
  );
}
