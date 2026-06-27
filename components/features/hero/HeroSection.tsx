"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface HeroSlide {
  heading: string;
  subheading: string;
  image: string;
  ctaPrimary: { label: string; href: string };
  ctaSecondary: { label: string; href: string };
}

const SLIDES: HeroSlide[] = [
  {
    heading: "The True Aroma\nof Ceylon Heritage",
    subheading:
      "From the lush lands of Sri Lanka comes nature's finest spices and timeless agarwood perfumes — crafted with passion, purity, and centuries of tradition.",
    image: "/images/hero/hero-banner.png",
    ctaPrimary: { label: "EXPLORE COLLECTION", href: "/shop" },
    ctaSecondary: { label: "SHOP NOW", href: "/shop" },
  },
  {
    heading: "Ceylon's Finest\nSpice Collection",
    subheading:
      "Premium cinnamon, cardamom, clove, and black pepper — hand-picked from the spice gardens of Ceylon for unmatched purity and flavour.",
    image: "/images/hero/hero-banner.png",
    ctaPrimary: { label: "DISCOVER SPICES", href: "/spices" },
    ctaSecondary: { label: "VIEW ALL", href: "/shop" },
  },
  {
    heading: "Timeless Agarwood\nPerfumes",
    subheading:
      "Experience the mystique of Sri Lankan agarwood — rare, luxurious, and crafted into perfumes that captivate the senses.",
    image: "/images/hero/hero-banner.png",
    ctaPrimary: { label: "EXPLORE PERFUMES", href: "/perfumes" },
    ctaSecondary: { label: "LEARN MORE", href: "/heritage" },
  },
];

const AUTO_PLAY_INTERVAL = 6000;

export function HeroSection() {
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
    goToSlide((current + 1) % SLIDES.length);
  }, [current, goToSlide]);

  useEffect(() => {
    const timer = setInterval(nextSlide, AUTO_PLAY_INTERVAL);
    return () => clearInterval(timer);
  }, [nextSlide]);

  const slide = SLIDES[current];

  return (
    <section className="relative w-full h-[500px] md:h-[600px] lg:h-[650px] overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <Image
          src={slide.image}
          alt="AromaVitae premium products"
          fill
          className="object-cover transition-transform duration-1000 ease-out scale-105"
          priority
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-warm-white/90 via-warm-white/50 to-transparent" />
      </div>

      {/* Ornamental Corners */}
      <div className="absolute top-4 left-4 w-16 h-16 border-t-2 border-l-2 border-gold/30" />
      <div className="absolute top-4 right-4 w-16 h-16 border-t-2 border-r-2 border-gold/30" />
      <div className="absolute bottom-4 left-4 w-16 h-16 border-b-2 border-l-2 border-gold/30" />
      <div className="absolute bottom-4 right-4 w-16 h-16 border-b-2 border-r-2 border-gold/30" />

      {/* Content */}
      <div className="relative z-10 max-w-[1400px] mx-auto px-6 h-full flex items-center">
        <div
          className={cn(
            "max-w-lg transition-all duration-700",
            isTransitioning
              ? "opacity-0 translate-y-4"
              : "opacity-100 translate-y-0"
          )}
        >
          <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold text-charcoal leading-tight whitespace-pre-line">
            {slide.heading}
          </h1>

          {/* Gold divider */}
          <div className="my-5 flex items-center gap-3">
            <div className="w-12 h-[1px] bg-gold" />
            <div className="w-2 h-2 bg-gold rotate-45" />
            <div className="w-12 h-[1px] bg-gold" />
          </div>

          <p className="text-muted text-sm md:text-base leading-relaxed mb-8 max-w-md">
            {slide.subheading}
          </p>

          <div className="flex flex-wrap gap-4">
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

      {/* Dot Pagination */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-3 z-20">
        {SLIDES.map((_, i) => (
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
