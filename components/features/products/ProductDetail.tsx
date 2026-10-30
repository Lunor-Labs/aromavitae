"use client";

import { useState } from "react";
import { ProductImageGallery } from "@/components/features/products/ProductImageGallery";
import { Price } from "@/components/ui/Price";
import type { Product } from "@/types/product";
import { cn, formatSize } from "@/lib/utils";

interface Props {
  product: Product;
}

export function ProductDetail({ product }: Props) {
  const tags = product.tags.filter(
    (tag) => !(product.isBestSeller && tag.trim().toLowerCase() === "best seller")
  );
  const { variants } = product;
  // Null until the customer picks a size: the price shows the first size, but
  // the gallery stays on the main shot rather than opening on one bottle.
  const [picked, setPicked] = useState<number | null>(null);
  const variant = variants[picked ?? 0];
  const size = variants.length > 0 ? null : formatSize(product);

  // Every size's photo is in the gallery, so each one can also be browsed to.
  const images = [product.image, ...(product.sideImages ?? [])];
  for (const v of variants) if (v.image && !images.includes(v.image)) images.push(v.image);

  return (
    <section className="py-16 md:py-24 bg-warm-white reveal">
      <div className="max-w-[1100px] mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
          {/* Images */}
          <ProductImageGallery
            images={images}
            alt={product.name}
            focus={picked == null ? undefined : (variant.image ?? undefined)}
          />

          {/* Info */}
          <div>
            {(product.isBestSeller || tags.length > 0) && (
              <div className="flex flex-wrap gap-2 mb-4">
                {product.isBestSeller && (
                  <span className="bg-gold text-warm-white text-[10px] font-bold tracking-[0.15em] px-3 py-1 rounded-sm uppercase">
                    Best Seller
                  </span>
                )}
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="bg-forest text-warm-white text-[10px] font-bold tracking-[0.15em] px-3 py-1 rounded-sm uppercase"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {product.category?.name && (
              <p className="text-xs font-medium tracking-[0.2em] text-forest uppercase mb-2">
                {product.category.name}
              </p>
            )}

            <h1 className={`font-heading text-3xl md:text-4xl font-bold text-charcoal leading-tight ${size ? "mb-2" : "mb-4"}`}>
              {product.name}
            </h1>
            {size && <p className="text-base text-muted mb-4">{size}</p>}

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

            <Price
              currency={product.currency}
              price={variant?.price ?? product.price}
              salePrice={variant ? variant.salePrice : product.salePrice}
              size="lg"
              className={variants.length > 0 ? "mb-6" : "mb-8"}
            />

            {variants.length > 0 && (
              <div className="mb-8">
                <h2 className="text-xs font-medium tracking-[0.2em] text-charcoal uppercase mb-3">
                  Size
                </h2>
                <div className="flex flex-wrap gap-2" role="group" aria-label="Size">
                  {variants.map((v, i) => {
                    const selected = v === variant;
                    return (
                      <button
                        key={v.id}
                        type="button"
                        aria-pressed={selected}
                        onClick={() => setPicked(i)}
                        className={cn(
                          "min-w-16 px-4 py-2 border rounded text-sm font-medium transition-colors duration-200",
                          selected
                            ? "bg-forest border-forest text-warm-white"
                            : "border-border text-charcoal hover:border-forest hover:text-forest"
                        )}
                      >
                        {formatSize(v)}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

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
