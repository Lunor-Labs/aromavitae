import Image from "next/image";
import Link from "next/link";
import { ProductCard } from "@/components/ui/ProductCard";
import type { Product } from "@/types/product";

interface Props {
  products: Product[];
}

// First 10 products by the admin's drag-and-drop order — two full rows on desktop
const MAX_PRODUCTS = 10;

export function OurBestProducts({ products }: Props) {
  return (
    <section className="py-16 md:py-24 bg-cream-dark reveal">
      <div className="max-w-[1400px] mx-auto px-6">
        {/* Section Heading */}
        <div className="text-center mb-12">
          <div className="mb-4 relative overflow-hidden h-9 md:h-24">
            <Image
              src="/images/misc/line.png"
              alt=""
              fill
              sizes="(min-width: 1400px) 1352px, calc(100vw - 48px)"
              style={{ objectFit: 'cover', objectPosition: 'center center' }}
            />
          </div>
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-charcoal tracking-wide">
            OUR BEST PRODUCTS
          </h2>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6">
          {products.slice(0, MAX_PRODUCTS).map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {/* View All Link */}
        <div className="text-center mt-10">
          <Link
            href="/products"
            className="inline-flex items-center gap-2 text-xs font-medium tracking-[0.2em] text-forest
                       underline underline-offset-4 decoration-gold hover:decoration-forest transition-colors duration-200"
          >
            VIEW ALL PRODUCTS
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}
