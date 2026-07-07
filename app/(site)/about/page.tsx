import type { Metadata } from "next";
import Image from "next/image";
import { PageHero } from "@/components/ui/PageHero";
import { ScrollRevealWrapper } from "@/components/ui/ScrollRevealWrapper";
import { TrustBadges } from "@/components/ui/TrustBadges";

export const metadata: Metadata = {
  title: "About Us — Our Heritage & Story",
  description:
    "Learn about AromaVitae's journey from the lush spice gardens of Sri Lanka to your doorstep. Discover our commitment to purity, sustainability, and the centuries-old traditions of Ceylon.",
  keywords: [
    "AromaVitae story",
    "Sri Lankan spice company",
    "Ceylon heritage",
    "sustainable spices",
    "about aromavitae",
  ],
  openGraph: {
    title: "About AromaVitae — Our Heritage & Story",
    description:
      "From the lush spice gardens of Sri Lanka to your doorstep. Discover our commitment to purity and tradition.",
  },
};

const VALUES = [
  {
    icon: "🌿",
    title: "Purity & Authenticity",
    description:
      "Every product we offer is 100% natural, free from additives, and sourced directly from trusted Sri Lankan farmers.",
  },
  {
    icon: "🤝",
    title: "Ethical Sourcing",
    description:
      "We work directly with local farmers, ensuring fair wages, sustainable practices, and the preservation of traditional methods.",
  },
  {
    icon: "✨",
    title: "Premium Quality",
    description:
      "Each batch is carefully inspected, hand-selected, and packaged to preserve the authentic aroma and flavour of Ceylon.",
  },
];

const TIMELINE = [
  {
    year: "Heritage",
    title: "Rooted in Tradition",
    description:
      "Our story begins in the verdant highlands of Sri Lanka, where spice cultivation has been a way of life for centuries. The island's unique microclimate creates conditions found nowhere else on Earth.",
  },
  {
    year: "Vision",
    title: "A New Chapter",
    description:
      "AromaVitae was born from a passion to share Sri Lanka's finest natural treasures with the world — premium spices and exquisite agarwood perfumes, crafted with uncompromising quality.",
  },
  {
    year: "Today",
    title: "Global Reach, Local Heart",
    description:
      "Today, we ship to customers worldwide while maintaining deep relationships with our farming communities. Every purchase supports sustainable agriculture in Sri Lanka.",
  },
  {
    year: "Future",
    title: "Growing Together",
    description:
      "We continue to expand our collection, exploring new ways to bring the essence of Ceylon to your home — from rare spice blends to artisanal agarwood creations.",
  },
];

export default function AboutPage() {
  return (
    <>
      <PageHero
        title="About AromaVitae"
        subtitle="Nature's Finest. Ceylon's Pride. Discover the passion, heritage, and tradition behind every product we craft."
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "About Us" },
        ]}
      />

      <ScrollRevealWrapper>
        {/* Our Story Section */}
        <section className="py-16 md:py-24 bg-warm-white reveal">
          <div className="max-w-[1400px] mx-auto px-6">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <div className="relative overflow-hidden mb-4" style={{ height: '36px' }}>
                  <Image
                    src="/images/misc/line.png"
                    alt=""
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    style={{ objectFit: 'cover', objectPosition: 'center center' }}
                  />
                </div>
                <span className="text-muted text-xs tracking-[0.3em] uppercase font-medium mb-3 block">
                  OUR STORY
                </span>
                <h2 className="font-heading text-3xl md:text-4xl font-bold text-charcoal leading-tight mb-6">
                  From Ceylon&apos;s Soil{"\n"}to Your Soul
                </h2>
                <div className="space-y-4 text-sm text-muted leading-relaxed">
                  <p>
                    Nestled among the misty mountains and tropical lowlands of Sri Lanka lies a
                    treasure trove of nature&apos;s finest offerings. For centuries, the island
                    known as Ceylon has been celebrated as the &ldquo;Spice Isle&rdquo; — a land
                    where cinnamon, pepper, cloves, and cardamom flourish in their purest forms.
                  </p>
                  <p>
                    AromaVitae was founded with a singular vision: to share these extraordinary
                    natural gifts with the world. We partner directly with local farmers who have
                    inherited generations of knowledge, ensuring that every product carries the
                    authentic essence of Sri Lankan heritage.
                  </p>
                  <p>
                    Our collection has grown to include exquisite agarwood perfumes — capturing
                    the mystical fragrance of one of the world&apos;s most precious natural
                    ingredients — alongside our signature spice range and curated gift sets.
                  </p>
                </div>
              </div>

              {/* Decorative panel */}
              <div className="relative bg-forest text-warm-white p-10 md:p-14 rounded-lg overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 opacity-10">
                  <svg viewBox="0 0 200 200" fill="none" className="w-full h-full">
                    <path
                      d="M100 10C60 30 20 70 30 120s60 60 100 70c40-10 80-20 70-70S140 30 100 10z"
                      stroke="currentColor"
                      strokeWidth="1"
                    />
                    <path
                      d="M80 40c-20 30-30 60-10 90s50 30 70 10 20-60 0-80-40-50-60-20z"
                      stroke="currentColor"
                      strokeWidth="0.5"
                    />
                  </svg>
                </div>

                <div className="relative z-10">
                  <div className="relative overflow-hidden mb-4" style={{ height: '36px' }}>
                    <Image
                      src="/images/misc/line.png"
                      alt=""
                      fill
                      sizes="(max-width: 768px) 100vw, 50vw"
                      style={{ objectFit: 'cover', objectPosition: 'center center' }}
                    />
                  </div>
                  <span className="text-gold text-xs tracking-[0.3em] uppercase font-medium mb-4 block">
                    OUR PROMISE
                  </span>
                  <h3 className="font-heading text-2xl md:text-3xl font-bold leading-tight mb-6">
                    Authenticity in{"\n"}Every Detail
                  </h3>
                  <p className="text-warm-white/80 text-sm leading-relaxed mb-6">
                    From the moment our spices are hand-harvested to the careful packaging
                    that preserves their potency — we never compromise. Our perfumes are
                    crafted from sustainably sourced agarwood, honoring both nature and
                    tradition.
                  </p>
                  <div className="relative overflow-hidden" style={{ height: '36px' }}>
                    <Image
                      src="/images/misc/line.png"
                      alt=""
                      fill
                      sizes="(max-width: 768px) 100vw, 50vw"
                      style={{ objectFit: 'cover', objectPosition: 'center center' }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="py-16 md:py-24 bg-cream reveal">
          <div className="max-w-[1400px] mx-auto px-6">
            <div className="text-center mb-12">
              <div className="mb-4 relative overflow-hidden" style={{ height: '36px' }}>
                <Image
                  src="/images/misc/line.png"
                  alt=""
                  fill
                  sizes="100vw"
                  style={{ objectFit: 'cover', objectPosition: 'center center' }}
                />
              </div>
              <h2 className="font-heading text-3xl md:text-4xl font-bold text-charcoal tracking-wide">
                OUR VALUES
              </h2>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {VALUES.map((value) => (
                <div
                  key={value.title}
                  className="bg-warm-white border border-border rounded-lg p-8 text-center
                             hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
                >
                  <span className="text-4xl block mb-4">{value.icon}</span>
                  <h3 className="font-heading text-lg font-bold text-charcoal mb-3">
                    {value.title}
                  </h3>
                  <p className="text-sm text-muted leading-relaxed">
                    {value.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Timeline Section */}
        <section className="py-16 md:py-24 bg-warm-white reveal">
          <div className="max-w-[900px] mx-auto px-6">
            <div className="text-center mb-12">
              <div className="relative overflow-hidden mb-4" style={{ height: '36px' }}>
                <Image
                  src="/images/misc/line.png"
                  alt=""
                  fill
                  sizes="(max-width: 900px) 100vw, 900px"
                  style={{ objectFit: 'cover', objectPosition: 'center center' }}
                />
              </div>
              <span className="text-muted text-xs tracking-[0.3em] uppercase font-medium mb-3 block">
                OUR JOURNEY
              </span>
              <h2 className="font-heading text-3xl md:text-4xl font-bold text-charcoal">
                The AromaVitae Story
              </h2>
            </div>

            <div className="relative">
              {/* Vertical line */}
              <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-[1px] bg-gold/30 -translate-x-1/2" />

              <div className="space-y-12">
                {TIMELINE.map((item, i) => (
                  <div
                    key={item.year}
                    className={`relative flex flex-col md:flex-row items-start gap-6 ${
                      i % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
                    }`}
                  >
                    {/* Dot on the line */}
                    <div className="absolute left-4 md:left-1/2 w-4 h-4 bg-gold rounded-full -translate-x-1/2 border-4 border-warm-white z-10 mt-1" />

                    {/* Content */}
                    <div
                      className={`md:w-1/2 pl-10 md:pl-0 ${
                        i % 2 === 0 ? "md:pr-12 md:text-right" : "md:pl-12"
                      }`}
                    >
                      <span className="text-gold text-xs tracking-[0.3em] font-bold uppercase">
                        {item.year}
                      </span>
                      <h3 className="font-heading text-xl font-bold text-charcoal mt-1 mb-2">
                        {item.title}
                      </h3>
                      <p className="text-sm text-muted leading-relaxed">
                        {item.description}
                      </p>
                    </div>

                    {/* Spacer for the other side */}
                    <div className="hidden md:block md:w-1/2" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Trust Badges */}
        <TrustBadges />
      </ScrollRevealWrapper>
    </>
  );
}
