import type { Metadata } from "next";
import { PageHero } from "@/components/ui/PageHero";
import { ScrollRevealWrapper } from "@/components/ui/ScrollRevealWrapper";
import { ProductsGrid } from "@/components/features/products/ProductsGrid";
import { fetchContent } from "@/lib/api";

// Content comes from the API at request time — see the note in lib/api.ts
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Products — Premium Ceylon Spices & Agarwood Perfumes",
  description:
    "Explore our curated collection of premium Ceylon spices, agarwood perfumes, and luxury gift sets. Ethically sourced from Sri Lanka with worldwide shipping.",
  keywords: [
    "Ceylon spices",
    "buy Ceylon cinnamon",
    "agarwood perfume",
    "Sri Lankan spices online",
    "premium spice gifts",
  ],
  openGraph: {
    title: "Products — AROMAVITAE Premium Collection",
    description:
      "Explore our curated collection of premium Ceylon spices and agarwood perfumes.",
  },
};

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const [{ category }, content] = await Promise.all([searchParams, fetchContent()]);

  return (
    <>
      <PageHero
        title="Our Products"
        tagline="PREMIUM COLLECTIONS"
        subtitle="Explore our curated collection of premium Ceylon spices, exquisite agarwood perfumes, and thoughtfully crafted gift sets."
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Products" },
        ]}
      />
      <ScrollRevealWrapper>
        <ProductsGrid
          products={content.products}
          categories={content.categories}
          initialCategoryId={category ?? null}
        />
      </ScrollRevealWrapper>
    </>
  );
}
