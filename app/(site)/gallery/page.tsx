import type { Metadata } from "next";
import { PageHero } from "@/components/ui/PageHero";
import { ScrollRevealWrapper } from "@/components/ui/ScrollRevealWrapper";
import { GalleryGrid } from "@/components/features/gallery/GalleryGrid";
import { fetchContent } from "@/lib/api";

// Gallery images come from the API at request time — see the note in lib/api.ts
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Gallery — Visual Journey into Ceylon's Finest",
  description:
    "Browse our gallery of premium Ceylon spices, agarwood perfumes, and the beautiful landscapes of Sri Lanka where our products originate.",
  keywords: [
    "Ceylon spice gallery",
    "agarwood images",
    "Sri Lanka spice farm",
    "premium spice photos",
  ],
  openGraph: {
    title: "Gallery — AromaVitae Visual Journey",
    description:
      "A visual journey into the world of premium Ceylon spices and agarwood perfumes.",
  },
};

export default async function GalleryPage() {
  const content = await fetchContent();

  return (
    <>
      <PageHero
        title="Our Gallery"
        tagline="VISUAL JOURNEY"
        subtitle="A visual journey through Ceylon's finest — from lush spice gardens to the artisan crafting of our premium products."
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Gallery" },
        ]}
      />
      <ScrollRevealWrapper>
        <GalleryGrid images={content.gallery} />
      </ScrollRevealWrapper>
    </>
  );
}
