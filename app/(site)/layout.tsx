import { AnnouncementBar } from "@/components/ui/AnnouncementBar";
import { Navbar } from "@/components/features/navbar/Navbar";
import { Footer } from "@/components/features/footer/Footer";
import { fetchContent } from "@/lib/api";

// Content is fetched from the API on every request. Without this the build
// short-circuits `fetchContent()` (see lib/api.ts) and Next.js has no signal
// to mark the layout dynamic — it would prerender an empty shell and serve
// that in prod, hiding every API-driven image.
export const dynamic = "force-dynamic";

export default async function SiteLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const content = await fetchContent();
  const { singletons } = content;

  return (
    <>
      <AnnouncementBar content={singletons.announcement} />
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer content={singletons.footer} />
    </>
  );
}
