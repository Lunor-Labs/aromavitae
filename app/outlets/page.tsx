import type { Metadata } from "next";
import { PageHero } from "@/components/ui/PageHero";
import { ScrollRevealWrapper } from "@/components/ui/ScrollRevealWrapper";
import { OutletsGrid } from "@/components/features/outlets/OutletsGrid";
import { fetchContent } from "@/lib/api";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Outlets — Visit AromaVitae Across Ceylon",
  description:
    "Find AromaVitae stores across Sri Lanka. Visit us in Colombo, Kandy, Galle and more to experience our Ceylon spices and agarwood perfumes in person.",
  keywords: [
    "AromaVitae stores",
    "AromaVitae outlets",
    "Ceylon spice shops",
    "Sri Lanka retail stores",
    "agarwood perfume boutique",
  ],
  openGraph: {
    title: "Outlets — Visit AromaVitae Across Ceylon",
    description:
      "Find AromaVitae stores across Sri Lanka and experience our collection in person.",
  },
};

export default async function OutletsPage() {
  const content = await fetchContent();

  return (
    <>
      <PageHero
        title="Our Outlets"
        subtitle="Visit AromaVitae in person — discover our stores across Ceylon and experience the true aromas of Sri Lanka."
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Outlets" },
        ]}
      />
      <ScrollRevealWrapper>
        <OutletsGrid outlets={content.outlets} />
      </ScrollRevealWrapper>
    </>
  );
}
