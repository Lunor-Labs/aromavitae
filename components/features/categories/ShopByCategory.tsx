import Image from "next/image";
import Link from "next/link";
import type { Category } from "@/types/product";

interface Props {
  categories: Category[];
}

export function ShopByCategory({ categories }: Props) {
  return (
    <section className="py-16 md:py-24 bg-warm-white reveal">
      <div className="max-w-[1400px] mx-auto px-6">
        <div className="flex flex-col md:flex-row md:items-center gap-8 md:gap-16">
          {/* Left — Heading */}
          <div className="shrink-0 md:max-w-[220px]">
            <div className="ornament-divider justify-start mb-4">
              <span className="ornament-diamond" />
            </div>
            <h2 className="font-heading text-2xl md:text-3xl font-bold text-charcoal tracking-wide mb-6">
              SHOP BY CATEGORY
            </h2>
            <Link
              href="/shop"
              className="inline-flex px-5 py-2.5 bg-forest text-warm-white text-xs font-medium
                         tracking-[0.15em] hover:bg-forest-light transition-colors duration-200 rounded"
            >
              VIEW ALL PRODUCTS
            </Link>
          </div>

          {/* Right — Category Cards (horizontal scroll) */}
          <div className="flex gap-5 overflow-x-auto pb-4 -mx-6 px-6 md:mx-0 md:px-0 snap-x snap-mandatory scrollbar-hide">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={cat.href}
                className="group shrink-0 w-[200px] md:w-[220px] snap-start"
              >
                <div className="relative aspect-square rounded-xl overflow-hidden bg-cream mb-3">
                  <Image
                    src={cat.image}
                    alt={cat.name}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                    sizes="220px"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-charcoal/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
                <p className="text-center text-xs font-medium tracking-[0.2em] text-charcoal group-hover:text-forest transition-colors duration-200">
                  {cat.name}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
