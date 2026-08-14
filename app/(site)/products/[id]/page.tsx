import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageHero } from "@/components/ui/PageHero";
import { ScrollRevealWrapper } from "@/components/ui/ScrollRevealWrapper";
import { ProductDetail } from "@/components/features/products/ProductDetail";
import { RelatedProducts } from "@/components/features/products/RelatedProducts";
import { fetchProduct, fetchContent } from "@/lib/api";

const MAX_RELATED = 4;

// Product data comes from the API at request time — see the note in lib/api.ts
export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const product = await fetchProduct(id);
  if (!product) return { title: "Product not found" };
  return {
    title: `${product.name} — AromaVitae`,
    description: product.description ?? `${product.name} from AromaVitae's premium collection.`,
    openGraph: {
      title: product.name,
      description: product.description ?? undefined,
      images: [{ url: product.image }],
    },
  };
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = await fetchProduct(id);
  if (!product) notFound();

  const content = await fetchContent();
  const sameCategory = content.products.filter(
    (p) => p.id !== product.id && p.categoryId && p.categoryId === product.categoryId
  );
  const fallback = content.products.filter((p) => p.id !== product.id);
  const related = (sameCategory.length > 0 ? sameCategory : fallback).slice(0, MAX_RELATED);

  return (
    <>
      <PageHero
        title={product.name}
        tagline={product.category?.name?.toUpperCase() ?? "PREMIUM COLLECTIONS"}
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Products", href: "/products" },
          { label: product.name },
        ]}
      />
      <ScrollRevealWrapper>
        <ProductDetail product={product} />
        <RelatedProducts products={related} />
      </ScrollRevealWrapper>
    </>
  );
}
