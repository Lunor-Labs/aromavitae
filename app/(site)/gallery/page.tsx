import type { Metadata } from "next";
import { PageHero } from "@/components/ui/PageHero";
import { ScrollRevealWrapper } from "@/components/ui/ScrollRevealWrapper";
import { GalleryGrid } from "@/components/features/gallery/GalleryGrid";

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

export default function GalleryPage() {
  return (
    <>
      <PageHero
        title="Our Gallery"
        subtitle="A visual journey through Ceylon's finest — from lush spice gardens to the artisan crafting of our premium products."
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Gallery" },
        ]}
      />
      <ScrollRevealWrapper>
        <GalleryGrid />
      </ScrollRevealWrapper>
    </>
  );
}
