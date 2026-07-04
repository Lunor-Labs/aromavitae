"use client";

import Link from "next/link";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface PageHeroProps {
  title: string;
  subtitle?: string;
  breadcrumbs?: BreadcrumbItem[];
}

export function PageHero({ title, subtitle, breadcrumbs }: PageHeroProps) {
  return (
    <section className="relative bg-forest overflow-hidden py-16 md:py-24">
      {/* Ornamental background pattern */}
      <div className="absolute inset-0 opacity-[0.05]">
        <svg className="w-full h-full" viewBox="0 0 400 400" fill="none">
          <pattern
            id="page-hero-pattern"
            x="0"
            y="0"
            width="60"
            height="60"
            patternUnits="userSpaceOnUse"
          >
            <circle
              cx="30"
              cy="30"
              r="15"
              fill="none"
              stroke="currentColor"
              strokeWidth="0.5"
              className="text-gold"
            />
            <rect
              x="15"
              y="15"
              width="30"
              height="30"
              fill="none"
              stroke="currentColor"
              strokeWidth="0.3"
              className="text-gold"
              transform="rotate(45 30 30)"
            />
          </pattern>
          <rect width="400" height="400" fill="url(#page-hero-pattern)" />
        </svg>
      </div>

      {/* Gold corner accents */}
      <div className="absolute top-4 left-4 w-12 h-12 border-t-2 border-l-2 border-gold/20" />
      <div className="absolute top-4 right-4 w-12 h-12 border-t-2 border-r-2 border-gold/20" />
      <div className="absolute bottom-4 left-4 w-12 h-12 border-b-2 border-l-2 border-gold/20" />
      <div className="absolute bottom-4 right-4 w-12 h-12 border-b-2 border-r-2 border-gold/20" />

      <div className="relative z-10 max-w-[1400px] mx-auto px-6 text-center">
        {/* Breadcrumbs */}
        {breadcrumbs && breadcrumbs.length > 0 && (
          <nav
            aria-label="Breadcrumb"
            className="flex items-center justify-center gap-2 mb-6"
          >
            {breadcrumbs.map((item, i) => (
              <span key={i} className="flex items-center gap-2">
                {i > 0 && (
                  <svg
                    className="w-3 h-3 text-gold/50"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                )}
                {item.href ? (
                  <Link
                    href={item.href}
                    className="text-xs tracking-[0.15em] text-warm-white/60 hover:text-gold transition-colors duration-200"
                  >
                    {item.label}
                  </Link>
                ) : (
                  <span className="text-xs tracking-[0.15em] text-gold">
                    {item.label}
                  </span>
                )}
              </span>
            ))}
          </nav>
        )}

        {/* Ornament */}
        <div className="flex items-center justify-center gap-3 mb-6">
          <div className="w-12 h-[1px] bg-gold/40" />
          <div className="w-2 h-2 bg-gold rotate-45" />
          <div className="w-12 h-[1px] bg-gold/40" />
        </div>

        {/* Title */}
        <h1 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold text-warm-white tracking-wide">
          {title}
        </h1>

        {/* Subtitle */}
        {subtitle && (
          <p className="mt-4 text-sm md:text-base text-warm-white/70 max-w-xl mx-auto leading-relaxed">
            {subtitle}
          </p>
        )}
      </div>
    </section>
  );
}
