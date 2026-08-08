import { ProductImageGallery } from "@/components/features/products/ProductImageGallery";
import type { Product } from "@/types/product";

interface Props {
  product: Product;
}

export function ProductDetail({ product }: Props) {
  const badge =
    product.badge && !(product.isBestSeller && product.badge.trim().toLowerCase() === "best seller")
      ? product.badge
      : null;

  return (
    <section className="py-16 md:py-24 bg-warm-white reveal">
      <div className="max-w-[1100px] mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
          {/* Images */}
          <ProductImageGallery
            images={[product.image, ...(product.sideImages ?? [])]}
            alt={product.name}
          />

          {/* Info */}
          <div>
            {(product.isBestSeller || badge) && (
              <div className="flex gap-2 mb-4">
                {product.isBestSeller && (
                  <span className="bg-gold text-warm-white text-[10px] font-bold tracking-[0.15em] px-3 py-1 rounded-sm uppercase">
                    Best Seller
                  </span>
                )}
                {badge && (
                  <span className="bg-forest text-warm-white text-[10px] font-bold tracking-[0.15em] px-3 py-1 rounded-sm uppercase">
                    {badge}
                  </span>
                )}
              </div>
            )}

            {product.category?.name && (
              <p className="text-xs font-medium tracking-[0.2em] text-forest uppercase mb-2">
                {product.category.name}
              </p>
            )}

            <h1 className="font-heading text-3xl md:text-4xl font-bold text-charcoal leading-tight mb-4">
              {product.name}
            </h1>

            {/* Rating */}
            <div className="flex items-center gap-2 mb-6">
              <div className="flex">
                {Array.from({ length: 5 }).map((_, i) => (
                  <svg
                    key={i}
                    className={`w-4 h-4 ${i < Math.floor(product.rating) ? "text-gold" : "text-border"}`}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <span className="text-sm text-muted">
                {product.rating.toFixed(1)} ({product.reviewCount} reviews)
              </span>
            </div>

            <p className="text-2xl font-bold text-charcoal mb-8">
              {product.currency} {product.price.toLocaleString()}
            </p>

            {product.description && (
              <div className="border-t border-border pt-6">
                <h2 className="text-xs font-medium tracking-[0.2em] text-charcoal uppercase mb-3">
                  Description
                </h2>
                <p className="text-sm text-muted leading-relaxed whitespace-pre-line">
                  {product.description}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
