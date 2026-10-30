import Link from "next/link";
import { Price } from "@/components/ui/Price";
import { RotatingImage } from "@/components/ui/RotatingImage";
import type { Product } from "@/types/product";
import { formatSize, percentOff } from "@/lib/utils";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const hasSizes = product.variants.length > 0;
  // "10ml / 30ml / 50ml" under the name when the product comes in several sizes.
  const size = hasSizes
    ? product.variants.map(formatSize).filter(Boolean).join(" / ")
    : formatSize(product);
  const offs = (hasSizes ? product.variants : [product]).map(
    (p) => percentOff(p.price, p.salePrice) ?? 0
  );
  const off = Math.max(...offs);
  const offLabel = offs.every((o) => o === off) ? `${off}% off` : `Up to ${off}% off`;

  return (
    <div className="group bg-warm-white border border-border rounded-lg overflow-hidden
                    hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
      {/* Image */}
      <Link href={`/products/${product.id}`} className="block relative aspect-[4/5] bg-cream overflow-hidden">
        <RotatingImage
          images={[product.image, ...(product.sideImages ?? [])]}
          alt={product.name}
          className="object-cover group-hover:scale-105 transition-transform duration-500"
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
        />
        {(product.isBestSeller || off > 0) && (
          <div className="absolute top-3 left-3 z-10 flex flex-wrap gap-1.5">
            {product.isBestSeller && (
              <span className="bg-gold text-warm-white text-[10px] font-bold tracking-[0.15em] px-3 py-1 rounded-sm uppercase">
                Best Seller
              </span>
            )}
            {off > 0 && (
              <span className="bg-forest text-warm-white text-[10px] font-bold tracking-[0.15em] px-3 py-1 rounded-sm uppercase">
                {offLabel}
              </span>
            )}
          </div>
        )}
      </Link>

      {/* Details */}
      <div className="p-4">
        <Link href={`/products/${product.id}`}>
          <h3 className={`text-sm font-medium text-charcoal leading-tight line-clamp-2 hover:text-forest transition-colors duration-200 ${size ? "mb-1" : "mb-2"}`}>
            {product.name}
          </h3>
        </Link>
        {size && <p className="text-xs text-muted mb-2">{size}</p>}

        {/* Rating */}
        <div className="flex items-center gap-1.5 mb-2">
          <div className="flex">
            {Array.from({ length: 5 }).map((_, i) => (
              <svg
                key={i}
                className={`w-3.5 h-3.5 ${i < Math.floor(product.rating) ? "text-gold" : "text-border"}`}
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
          </div>
          <span className="text-xs text-muted">({product.reviewCount})</span>
        </div>

        {/* Price */}
        <Price
          currency={product.currency}
          price={product.price}
          salePrice={product.salePrice}
          from={hasSizes}
          className="mb-3"
        />

        {/* Add to Cart */}
        <button
          className="w-full py-2.5 bg-forest text-warm-white text-xs font-medium tracking-[0.15em]
                     hover:bg-forest-light transition-colors duration-200 rounded"
        >
          ADD TO CART
        </button>
      </div>
    </div>
  );
}
