import Link from "next/link";
import { ProductCard } from "@/components/ui/ProductCard";
import type { Product } from "@/types/product";

interface Props {
  products: Product[];
}

export function BestSellers({ products }: Props) {
  return (
    <section className="py-16 md:py-24 bg-cream-dark reveal">
      <div className="max-w-[1400px] mx-auto px-6">
        {/* Section Heading */}
        <div className="text-center mb-12">
          <div className="ornament-divider mb-4">
            <span className="ornament-diamond" />
          </div>
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-charcoal tracking-wide">
            BEST SELLERS
          </h2>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {/* View All Link */}
        <div className="text-center mt-10">
          <Link
            href="/shop/best-sellers"
            className="inline-flex items-center gap-2 text-xs font-medium tracking-[0.2em] text-forest
                       underline underline-offset-4 decoration-gold hover:decoration-forest transition-colors duration-200"
          >
            VIEW ALL BEST SELLERS
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}
