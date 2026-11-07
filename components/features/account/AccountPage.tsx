import { PageHero, type BreadcrumbItem } from "@/components/ui/PageHero";

interface AccountPageProps {
  title: string;
  breadcrumbs?: BreadcrumbItem[];
  /** Forms read better narrow; lists and tables need the room. */
  width?: "narrow" | "wide";
  children: React.ReactNode;
}

/** The shared frame of every account page. */
export function AccountPage({ title, breadcrumbs, width = "narrow", children }: AccountPageProps) {
  const widthClass = width === "narrow" ? "max-w-md" : "max-w-[1000px]";
  return (
    <>
      <PageHero title={title} tagline="YOUR ACCOUNT" breadcrumbs={breadcrumbs ?? [{ label: "Home", href: "/" }, { label: title }]} />
      <section className="py-14 md:py-20 bg-warm-white">
        <div className={`${widthClass} mx-auto px-6`}>{children}</div>
      </section>
    </>
  );
}
