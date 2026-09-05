import Image from "next/image";

const BADGES = [
  { image: "/images/misc/100-natural.png", title: "100% ORGANIC", subtitle: "Pure & Natural Ingredients." },
  { image: "/images/misc/sri-lankan-origin.png", title: "SRI LANKAN ORIGIN", subtitle: "Proudly Ceylon. Pure & Authentic." },
  { image: "/images/misc/premium-quality.png", title: "PREMIUM QUALITY", subtitle: "Carefully Sourced. Expertly Crafted." },
  { image: "/images/misc/luxury-experience.png", title: "LUXURY EXPERIENCE", subtitle: "Perfect for You & Your Loved Ones." },
  { image: "/images/misc/worldwide-shipping.png", title: "WORLDWIDE SHIPPING", subtitle: "Delivering Nature's Finest to You." },
];

export function TrustBadges() {
  return (
    <section className="py-8 bg-cream border-y border-border reveal">
      <div className="max-w-[1400px] mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 md:gap-4">
          {BADGES.map((badge) => (
            <div
              key={badge.title}
              className="flex items-center gap-3 md:justify-center"
            >
              <Image
                src={badge.image}
                alt={badge.title}
                width={40}
                height={40}
                className="w-10 h-10 object-contain shrink-0"
              />
              <div>
                <p className="text-xs font-bold text-charcoal tracking-wider">
                  {badge.title}
                </p>
                <p className="text-[11px] text-muted leading-tight">
                  {badge.subtitle}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
