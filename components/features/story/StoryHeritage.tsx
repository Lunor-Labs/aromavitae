import Link from "next/link";
import type { StoryContent } from "@/types/content";

interface Props {
  content: StoryContent;
}

const ICON_PATHS: Record<string, string> = {
  book: "M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253",
  leaf: "M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
  shield: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z",
};

function BadgeIcon({ name }: { name: string }) {
  const path = ICON_PATHS[name] ?? ICON_PATHS.book;
  return (
    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={path} />
    </svg>
  );
}

export function StoryHeritage({ content }: Props) {
  const { ourStory, heritage } = content;

  return (
    <section className="reveal">
      <div className="grid md:grid-cols-2">
        {/* Left Panel — Our Story */}
        <div className="relative bg-forest text-warm-white p-10 md:p-16 flex flex-col justify-center overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 opacity-10">
            <svg viewBox="0 0 200 200" fill="none" className="w-full h-full">
              <path d="M100 10C60 30 20 70 30 120s60 60 100 70c40-10 80-20 70-70S140 30 100 10z" stroke="currentColor" strokeWidth="1" />
              <path d="M80 40c-20 30-30 60-10 90s50 30 70 10 20-60 0-80-40-50-60-20z" stroke="currentColor" strokeWidth="0.5" />
            </svg>
          </div>

          <span className="text-gold text-xs tracking-[0.3em] uppercase font-medium mb-4">
            {ourStory.eyebrow}
          </span>
          <h2 className="font-heading text-3xl md:text-4xl font-bold leading-tight mb-6 whitespace-pre-line">
            {ourStory.heading}
          </h2>
          <p className="text-warm-white/80 text-sm leading-relaxed mb-8 max-w-md">
            {ourStory.body}
          </p>
          <Link
            href={ourStory.ctaHref}
            className="inline-flex self-start px-6 py-3 border border-warm-white/40 text-warm-white text-xs
                       tracking-[0.2em] hover:bg-warm-white/10 transition-all duration-300"
          >
            {ourStory.ctaLabel}
          </Link>
        </div>

        {/* Right Panel — Heritage */}
        <div className="relative bg-cream p-10 md:p-16 flex flex-col justify-center">
          <div className="absolute inset-0 bg-gradient-to-bl from-cream via-cream to-cream-dark opacity-90" />

          <div className="relative z-10">
            <span className="text-muted text-xs tracking-[0.3em] uppercase font-medium mb-3 block">
              {heritage.eyebrow}
            </span>
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-charcoal leading-tight mb-6">
              {heritage.heading}
            </h2>
            <p className="text-muted text-sm leading-relaxed mb-8 max-w-md">
              {heritage.body}
            </p>

            <div className="flex flex-wrap gap-8 mb-8">
              {heritage.badges.map((badge) => (
                <div key={badge.label} className="flex flex-col items-center gap-2 text-center">
                  <div className="w-14 h-14 rounded-full bg-forest/10 flex items-center justify-center text-forest">
                    <BadgeIcon name={badge.icon} />
                  </div>
                  <span className="text-xs font-medium text-charcoal tracking-wide">
                    {badge.label}
                  </span>
                </div>
              ))}
            </div>

            <Link
              href={heritage.ctaHref}
              className="inline-flex items-center gap-2 text-xs font-medium tracking-[0.15em] text-forest
                         underline underline-offset-4 decoration-gold hover:decoration-forest transition-colors duration-200"
            >
              {heritage.ctaLabel}
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
