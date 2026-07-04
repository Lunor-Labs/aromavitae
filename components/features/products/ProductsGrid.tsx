"use client";

import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import { assetUrl } from "@/lib/storage";
import { ProductCard } from "@/components/ui/ProductCard";
import type { Product } from "@/types/product";

const ALL_PRODUCTS: Product[] = [
  {
    id: "1",
    name: "Ceylon Cinnamon Premium Quality",
    price: 1450,
    currency: "LKR",
    rating: 5,
    reviewCount: 128,
    image: assetUrl("products/cinnamon.png"),
    badge: "Best Seller",
    category: "Spices",
  },
  {
    id: "2",
    name: "Clove Whole Premium Quality",
    price: 1350,
    currency: "LKR",
    rating: 4.5,
    reviewCount: 96,
    image: assetUrl("products/clove.png"),
    badge: "Best Seller",
    category: "Spices",
  },
  {
    id: "3",
    name: "Cardamom Green Premium Quality",
    price: 1750,
    currency: "LKR",
    rating: 5,
    reviewCount: 123,
    image: assetUrl("products/cardamom.png"),
    badge: "Popular",
    category: "Spices",
  },
  {
    id: "4",
    name: "Black Pepper Whole Premium Quality",
    price: 1750,
    currency: "LKR",
    rating: 4.5,
    reviewCount: 118,
    image: assetUrl("products/pepper.png"),
    category: "Spices",
  },
  {
    id: "5",
    name: "Ceylon Oud Pure Perfume 12ml",
    price: 9950,
    currency: "LKR",
    rating: 5,
    reviewCount: 87,
    image: assetUrl("products/perfume.png"),
    badge: "Premium",
    category: "Perfumes",
  },
  {
    id: "6",
    name: "Ceylon Cinnamon Sticks — Gift Pack",
    price: 2450,
    currency: "LKR",
    rating: 5,
    reviewCount: 64,
    image: assetUrl("products/cinnamon.png"),
    badge: "Gift",
    category: "Gift Sets",
  },
  {
    id: "7",
    name: "Black Pepper Ground Premium",
    price: 1250,
    currency: "LKR",
    rating: 4,
    reviewCount: 55,
    image: assetUrl("products/pepper.png"),
    category: "Spices",
  },
  {
    id: "8",
    name: "Ceylon Oud Attar — Royal Collection",
    price: 14500,
    currency: "LKR",
    rating: 5,
    reviewCount: 42,
    image: assetUrl("products/perfume.png"),
    badge: "Luxury",
    category: "Perfumes",
  },
];

const CATEGORIES = ["All", "Spices", "Perfumes", "Gift Sets"];

export function ProductsGrid() {
  const [activeCategory, setActiveCategory] = useState("All");

  const filteredProducts = useMemo(() => {
    if (activeCategory === "All") return ALL_PRODUCTS;
    return ALL_PRODUCTS.filter((p) => p.category === activeCategory);
  }, [activeCategory]);

  return (
    <section className="py-16 md:py-24 bg-warm-white reveal">
      <div className="max-w-[1400px] mx-auto px-6">
        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={cn(
                "px-5 py-2.5 text-xs font-medium tracking-[0.15em] rounded-full border transition-all duration-300",
                activeCategory === cat
                  ? "bg-forest text-warm-white border-forest"
                  : "bg-transparent text-charcoal border-border hover:border-forest hover:text-forest"
              )}
            >
              {cat.toUpperCase()}
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
