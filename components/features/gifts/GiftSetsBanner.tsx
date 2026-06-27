import Image from "next/image";
import Link from "next/link";

export function GiftSetsBanner() {
  return (
    <section className="reveal">
      <div className="grid md:grid-cols-2">
        {/* Left — Image */}
        <div className="relative h-[300px] md:h-[400px] bg-cream overflow-hidden">
          <Image
            src="/images/products/cardamom.png"
            alt="Premium gift set with spice jars and cinnamon"
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        </div>

        {/* Right — CTA Panel */}
        <div className="relative bg-forest p-10 md:p-16 flex flex-col justify-center overflow-hidden">
          {/* Decorative geometric pattern */}
          <div className="absolute inset-0 opacity-[0.07]">
            <svg className="w-full h-full" viewBox="0 0 400 400" fill="none">
              <pattern id="geo" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
                <rect x="0" y="0" width="40" height="40" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-gold" />
                <circle cx="20" cy="20" r="10" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-gold" />
                <rect x="10" y="10" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="0.3" className="text-gold" transform="rotate(45 20 20)" />
              </pattern>
              <rect width="400" height="400" fill="url(#geo)" />
            </svg>
          </div>

          <div className="relative z-10">
            <span className="text-gold text-xs tracking-[0.3em] uppercase font-medium mb-3 block">
              THE PERFECT GIFT OF NATURE
            </span>
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-warm-white leading-tight mb-4">
              Premium Gift Sets
            </h2>
            <p className="text-warm-white/70 text-sm leading-relaxed mb-8 max-w-md">
              Elegantly curated gift sets featuring our finest spices and
              agarwood perfumes.
            </p>
            <Link
              href="/gift-sets"
              className="inline-flex px-7 py-3 border border-gold text-gold text-xs font-medium
                         tracking-[0.2em] hover:bg-gold hover:text-forest transition-all duration-300"
            >
              EXPLORE GIFT SETS
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
