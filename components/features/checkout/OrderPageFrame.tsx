import { PageHero } from "@/components/ui/PageHero";

interface OrderPageFrameProps {
  title: string;
  tagline?: string;
  children: React.ReactNode;
}

/** The shared frame of the checkout and order pages. */
export function OrderPageFrame({ title, tagline = "SHOP", children }: OrderPageFrameProps) {
  return (
    <>
      <PageHero title={title} tagline={tagline} breadcrumbs={[{ label: "Home", href: "/" }, { label: title }]} />
      <section className="py-14 md:py-20 bg-warm-white">
        <div className="max-w-[1100px] mx-auto px-6">{children}</div>
      </section>
    </>
  );
}
