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

/** One category's products, or the ones without a category (`category: null`). */
interface Section {
  category: Category | null;
  products: Product[];
}

/**
 * The products page: each category is its own section under its heading and
 * intro, in the admin's category order, with uncategorized products last. A
 * filter chip narrows it to one section.
 */
export function ProductsGrid({ products, categories, initialCategoryId }: Props) {
  const [activeCategoryId, setActiveCategoryId] = useState(() =>
    initialCategoryId && categories.some((c) => c.id === initialCategoryId)
      ? initialCategoryId
      : ALL
  );

  const sections = useMemo<Section[]>(() => {
    const all: Section[] = [
      ...categories.map((category) => ({
        category,
        products: products.filter((p) => p.categoryId === category.id),
      })),
      {
        category: null,
        products: products.filter((p) => !categories.some((c) => c.id === p.categoryId)),
      },
    ];
    return all.filter(
      (s) => s.products.length > 0 && (activeCategoryId === ALL || s.category?.id === activeCategoryId)
    );
  }, [activeCategoryId, categories, products]);

  const shown = sections.reduce((n, s) => n + s.products.length, 0);

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
          Showing {shown} {shown === 1 ? "product" : "products"}
        </p>

        {shown > 0 ? (
          <div className="space-y-16 md:space-y-24">
            {sections.map((section) => (
              <div key={section.category?.id ?? "other"} id={section.category ? `collection-${section.category.id}` : undefined}>
                {section.category && <SectionHeader category={section.category} />}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {section.products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              </div>
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

/** The category name as a small label over its headline, or as the heading itself when it has none. */
function SectionHeader({ category }: { category: Category }) {
  const { name, headline, intro, highlight, signoff } = category;
  return (
    <header className="max-w-3xl mx-auto text-center mb-10">
      {headline && (
        <p className="text-xs font-medium tracking-[0.25em] text-gold-dark uppercase mb-3">{name}</p>
      )}
      <h2 className={cn("font-heading text-3xl md:text-4xl font-bold text-charcoal", headline && "italic")}>
        {headline || name}
      </h2>
      {intro && <p className="text-sm md:text-base text-muted leading-relaxed mt-4">{intro}</p>}
      {highlight && (
        <p className="text-xs font-bold tracking-[0.2em] text-gold-dark uppercase mt-5">{highlight}</p>
      )}
      {signoff && <p className="text-xs text-muted tracking-wider mt-2">{signoff}</p>}
    </header>
  );
}
