"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import type { HeroContent } from "@/types/content";

interface Props {
  content: HeroContent;
}

export function HeroSection({ content }: Props) {
  const slides = content.slides;
  const autoPlayMs = content.autoPlayMs ?? 6000;

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

      <div className="absolute top-4 left-4 w-16 h-16 border-t-2 border-l-2 border-gold/30" />
      <div className="absolute top-4 right-4 w-16 h-16 border-t-2 border-r-2 border-gold/30" />
      <div className="absolute bottom-4 left-4 w-16 h-16 border-b-2 border-l-2 border-gold/30" />
      <div className="absolute bottom-4 right-4 w-16 h-16 border-b-2 border-r-2 border-gold/30" />

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
