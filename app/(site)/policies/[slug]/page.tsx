import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageHero } from "@/components/ui/PageHero";
import { RichText } from "@/components/ui/RichText";
import { getLegalPage } from "@/lib/content";

interface Props {
  params: Promise<{ slug: string }>;
}

// Rendered on first visit, then cached and refreshed like every other page.
export function generateStaticParams() {
  return [];
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const page = await getLegalPage((await params).slug);
  return { title: page?.title ?? "Page not found" };
}

export default async function PolicyPage({ params }: Props) {
  const page = await getLegalPage((await params).slug);
  if (!page) notFound();

  return (
    <>
      <PageHero
        title={page.title}
        tagline="POLICIES"
        breadcrumbs={[{ label: "Home", href: "/" }, { label: page.title }]}
      />
      <section className="py-16 md:py-24 bg-warm-white">
        <div className="max-w-[800px] mx-auto px-6">
          <RichText html={page.content} />
        </div>
      </section>
    </>
  );
}
