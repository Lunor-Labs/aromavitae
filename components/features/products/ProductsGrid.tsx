"use client";

import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import { ProductCard } from "@/components/ui/ProductCard";
import type { Category, Product } from "@/types/product";

const ALL = "all";

interface Props {
  products: Product[];
  categories: Category[];
  initialCategoryId?: string | null;
}

export function ProductsGrid({ products, categories, initialCategoryId }: Props) {
  const [activeCategoryId, setActiveCategoryId] = useState(() =>
    initialCategoryId && categories.some((c) => c.id === initialCategoryId)
      ? initialCategoryId
      : ALL
  );

  const filteredProducts = useMemo(() => {
    if (activeCategoryId === ALL) return products;
    return products.filter((p) => p.categoryId === activeCategoryId);
  }, [activeCategoryId, products]);

  return (
    <section className="py-16 md:py-24 bg-warm-white reveal">
      <div className="max-w-[1400px] mx-auto px-6">
        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {[{ id: ALL, name: "All" }, ...categories].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategoryId(cat.id)}
              className={cn(
                "px-5 py-2.5 text-xs font-medium tracking-[0.15em] rounded-full border transition-all duration-300",
                activeCategoryId === cat.id
                  ? "bg-forest text-warm-white border-forest"
                  : "bg-transparent text-charcoal border-border hover:border-forest hover:text-forest"
              )}
            >
              {cat.name.toUpperCase()}
            </button>
          ))}
        </div>

        {/* Product count */}
        <p className="text-center text-xs text-muted tracking-wider mb-8">
          Showing {filteredProducts.length}{" "}
          {filteredProducts.length === 1 ? "product" : "products"}
        </p>

        {/* Products Grid */}
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="text-4xl mb-4">🌿</div>
            <p className="font-heading text-xl text-charcoal mb-2">
              No products found
            </p>
            <p className="text-sm text-muted">
              Try selecting a different category.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
