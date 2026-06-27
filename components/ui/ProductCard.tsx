import Image from "next/image";
import type { Product } from "@/types/product";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  return (
    <div className="group bg-warm-white border border-border rounded-lg overflow-hidden
                    hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
      {/* Image */}
      <div className="relative aspect-[4/5] bg-cream overflow-hidden">
        <Image
          src={product.image}
          alt={product.name}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
        />
        {product.badge && (
          <span className="absolute top-3 left-3 bg-gold text-warm-white text-[10px] font-bold
                           tracking-[0.15em] px-3 py-1 rounded-sm uppercase">
            {product.badge}
          </span>
        )}
      </div>

      {/* Details */}
      <div className="p-4">
        <h3 className="text-sm font-medium text-charcoal leading-tight mb-2 line-clamp-2">
          {product.name}
        </h3>

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
        <p className="text-sm font-bold text-charcoal mb-3">
          {product.currency} {product.price.toLocaleString()}
        </p>

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
