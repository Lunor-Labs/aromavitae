"use client";

import { useState, useEffect, useCallback } from "react";
import Image, { getImageProps } from "next/image";
import heroDesktop from "@/public/images/hero/hero-banner-desktop.webp";
import heroMobile from "@/public/images/hero/hero-banner-mobile.webp";
import Link from "next/link";
import { cn } from "@/lib/utils";
import type { HeroSlide } from "@/types/content";

// TODO(admin): editorial content to be supplied — replace slides / autoplay below.
const SLIDES: HeroSlide[] = [
  {
    heading: "Nature's Finest,\nCeylon's Pride",
    subheading:
      "Discover the timeless aroma of Sri Lanka — premium spices and agarwood perfumes handcrafted with passion.",
    image: "/images/hero/hero-banner.png",
    ctaPrimary: { label: "SHOP SPICES", href: "/products" },
    ctaSecondary: { label: "EXPLORE PERFUMES", href: "/products" },
  },
];
const AUTOPLAY_MS = 6000;

/**
 * The desktop and mobile banners are different crops of the same shot
 * (2560x1067 landscape vs 800x1000 portrait), so this is art direction, not a
 * responsive image — the two cannot be collapsed into a single srcSet.
 *
 * Two <Image>s toggled with hidden/md:block is the obvious way to write that
 * and the wrong one: display:none does not stop a fetch, so every visitor
 * downloaded *both* crops, and priority on each preloaded both as well. Only
 * <picture>'s media attribute actually stops the browser fetching the crop it
 * will not show, so the banners are built with getImageProps — still optimized
 * and still served through /_next/image, just chosen before the fetch rather
 * than hidden after it.
 */
function HeroBanner() {
  // Imported rather than referenced by path, which buys three things: the
  // intrinsic dimensions come from the file, Next generates the blurred
  // `placeholder` at build time, and the emitted URL is content-hashed — so the
  // year-long `minimumCacheTTL` can never pin a stale banner after a redeploy.
  const common = {
    alt: "AROMAVITAE premium products",
    sizes: "100vw",
    priority: true,
    placeholder: "blur",
  } as const;

  const {
    props: { srcSet: desktopSrcSet },
  } = getImageProps({ ...common, src: heroDesktop });

  const {
    props: { srcSet: mobileSrcSet, ...imgProps },
  } = getImageProps({ ...common, src: heroMobile });

  return (
    <picture>
      <source media="(min-width: 768px)" srcSet={desktopSrcSet} sizes="100vw" />
      <source media="(max-width: 767px)" srcSet={mobileSrcSet} sizes="100vw" />
      {/* `imgProps.style` carries the blurred placeholder as a background on the
          image itself. Unlike <Image>, a bare <img> never clears it — which is
          fine here, because the loaded photo covers the box completely and
          occludes it. */}
      {/* eslint-disable-next-line jsx-a11y/alt-text -- `alt` arrives through the
          `imgProps` spread; getImageProps carries it over from `common`. */}
      <img
        {...imgProps}
        fetchPriority="high"
        className="absolute inset-0 h-full w-full object-cover transition-transform duration-1000 ease-out scale-105"
      />
    </picture>
  );
}

export function HeroSection() {
  const slides = SLIDES;
  const autoPlayMs = AUTOPLAY_MS;

  const [current, setCurrent] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const goToSlide = useCallback(
    (index: number) => {
      if (isTransitioning) return;
      setIsTransitioning(true);
      setCurrent(index);
      setTimeout(() => setIsTransitioning(false), 700);
    },
    [isTransitioning]
  );

  const nextSlide = useCallback(() => {
    if (slides.length === 0) return;
    goToSlide((current + 1) % slides.length);
  }, [current, goToSlide, slides.length]);

  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setInterval(nextSlide, autoPlayMs);
    return () => clearInterval(timer);
  }, [nextSlide, autoPlayMs, slides.length]);

  if (slides.length === 0) return null;
  const slide = slides[current];

  return (
    <section className="relative w-full h-[500px] md:h-[600px] lg:h-[650px] overflow-hidden">
      <div className="absolute inset-0">
        <HeroBanner />
        <div className="absolute inset-0 bg-gradient-to-r from-warm-white/90 via-warm-white/50 to-transparent" />
      </div>

      <div className="absolute top-4 left-4 w-16 h-16 border-t-2 border-l-2 border-gold/30" />
      <div className="absolute top-4 right-4 w-16 h-16 border-t-2 border-r-2 border-gold/30" />
      <div className="absolute bottom-4 left-4 w-16 h-16 border-b-2 border-l-2 border-gold/30" />
      <div className="absolute bottom-4 right-4 w-16 h-16 border-b-2 border-r-2 border-gold/30" />

      <div className="relative z-10 max-w-[1400px] mx-auto px-6 h-full flex items-start pt-7 md:items-center md:pt-0">
        <div
          className={cn(
            "max-w-lg transition-all duration-700 flex flex-col",
            isTransitioning
              ? "opacity-0 translate-y-4"
              : "opacity-100 translate-y-0"
          )}
        >
          <p className="order-1 md:order-3 text-muted text-sm md:text-base leading-relaxed mb-6 md:mb-8 max-w-md">
            {slide.subheading}
          </p>

          <h1 className="order-2 md:order-1 font-heading text-4xl md:text-5xl lg:text-6xl font-bold text-charcoal leading-tight whitespace-pre-line">
            {slide.heading}
          </h1>

          <div className="order-3 md:order-2 my-5 relative overflow-hidden max-w-xs" style={{ height: '36px' }}>
            <Image
              src="/images/misc/line.png"
              alt=""
              fill
              sizes="320px"
              style={{ objectFit: 'cover', objectPosition: 'center center' }}
            />
          </div>

          <div className="order-4 flex flex-wrap gap-4">
            <Link
              href={slide.ctaPrimary.href}
              className="px-7 py-3 bg-forest text-warm-white text-xs font-medium tracking-[0.2em]
                         hover:bg-forest-light transition-all duration-300
                         border border-gold/20 hover:border-gold/40"
            >
              {slide.ctaPrimary.label}
            </Link>
            <Link
              href={slide.ctaSecondary.href}
              className="px-7 py-3 border-2 border-forest text-forest text-xs font-medium tracking-[0.2em]
                         hover:bg-forest hover:text-warm-white transition-all duration-300"
            >
              {slide.ctaSecondary.label}
            </Link>
          </div>
        </div>
      </div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-3 z-20">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => goToSlide(i)}
            className={cn(
              "w-2.5 h-2.5 rounded-full transition-all duration-300",
              i === current
                ? "bg-gold w-8 rounded-full"
                : "bg-charcoal/30 hover:bg-charcoal/50"
            )}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>
    </section>
  );
}
