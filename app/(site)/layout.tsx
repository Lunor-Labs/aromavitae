import type { Metadata } from "next";
import { Playfair_Display, Ubuntu } from "next/font/google";
import "../globals.css";
import { AnnouncementBar } from "@/components/ui/AnnouncementBar";
import { Navbar } from "@/components/features/navbar/Navbar";
import { Footer } from "@/components/features/footer/Footer";
import { getContent } from "@/lib/content";

// Content is read from Payload on every request, so the admin's edits show up
// on the next page load without a rebuild.
export const dynamic = "force-dynamic";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

const ubuntu = Ubuntu({
  variable: "--font-ubuntu",
  subsets: ["latin"],
  display: "swap",
  weight: ["300", "400", "500", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://aromavitae.lk"),
  title: {
    default: "AROMAVITAE — Premium Sri Lankan Spices & Agarwood Perfumes",
    template: "%s | AROMAVITAE",
  },
  description:
    "Discover nature's finest Ceylon spices and timeless agarwood perfumes, crafted with passion, purity, and centuries of Sri Lankan tradition. Worldwide shipping.",
  keywords: [
    "Ceylon spices",
    "Sri Lankan spices",
    "agarwood perfume",
    "Ceylon cinnamon",
    "premium spices",
    "Ceylon Oud",
    "gift sets",
  ],
  openGraph: {
    title: "AROMAVITAE — Premium Sri Lankan Spices & Agarwood Perfumes",
    description:
      "Nature's Finest. Ceylon's Pride. Premium spices and agarwood perfumes from Sri Lanka.",
    type: "website",
    locale: "en_US",
  },
  robots: { index: true, follow: true },
};

export default async function SiteLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { singletons } = await getContent();

  return (
    <html
      lang="en"
      className={`${playfair.variable} ${ubuntu.variable} h-full`}
    >
      <body className="min-h-full flex flex-col antialiased">
        {singletons.announcement.messages.length > 0 && (
          <AnnouncementBar content={singletons.announcement} />
        )}
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer content={singletons.footer} />
      </body>
    </html>
  );
}
