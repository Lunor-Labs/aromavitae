import type { Metadata } from "next";
import { PageHero } from "@/components/ui/PageHero";
import { ScrollRevealWrapper } from "@/components/ui/ScrollRevealWrapper";
import { BlogList } from "@/components/features/blog/BlogList";

export const metadata: Metadata = {
  title: "Blog — Spice Stories, Wellness Tips & Recipes",
  description:
    "Explore our blog for stories about Ceylon spices, wellness tips, authentic Sri Lankan recipes, and behind-the-scenes glimpses of AromaVitae.",
  keywords: [
    "Ceylon spice blog",
    "Sri Lankan recipes",
    "spice wellness tips",
    "agarwood perfume guide",
    "AromaVitae blog",
  ],
  openGraph: {
    title: "Blog — AromaVitae Stories & Insights",
    description:
      "Stories about Ceylon spices, wellness tips, authentic recipes, and behind-the-scenes glimpses.",
  },
};

export default function BlogPage() {
  return (
    <>
      <PageHero
        title="Our Blog"
        subtitle="Stories, recipes, and insights from the world of premium Ceylon spices and agarwood perfumes."
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Blog" },
        ]}
      />
      <ScrollRevealWrapper>
        <BlogList />
      </ScrollRevealWrapper>
    </>
  );
}
