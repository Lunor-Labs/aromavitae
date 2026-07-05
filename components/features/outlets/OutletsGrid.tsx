import Image from "next/image";
import type { Outlet } from "@/types/product";

interface Props {
  outlets: Outlet[];
}

export function OutletsGrid({ outlets }: Props) {
  if (outlets.length === 0) {
    return (
      <section className="py-16 md:py-24 bg-warm-white reveal">
        <div className="max-w-[1400px] mx-auto px-6 text-center">
          <p className="text-muted font-body">
            Our outlets will be listed here soon. Please check back shortly.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 md:py-24 bg-warm-white reveal">
      <div className="max-w-[1400px] mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {outlets.map((outlet) => (
            <article
              key={outlet.id}
              className="group flex flex-col bg-cream rounded-xl overflow-hidden border border-border/60 hover:shadow-lg transition-shadow duration-300"
            >
              <div className="relative aspect-[4/3] overflow-hidden bg-cream-dark">
                <Image
                  src={outlet.image}
                  alt={outlet.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                  sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
                />
              </div>
              <div className="flex flex-col gap-4 p-6 md:p-7 flex-1">
                <div>
                  <div className="ornament-divider justify-start mb-3">
                    <span className="ornament-diamond" />
                  </div>
                  <h3 className="font-heading text-xl md:text-2xl font-bold text-forest tracking-wide">
                    {outlet.name}
                  </h3>
                </div>

                <p className="text-sm text-charcoal/80 font-body leading-relaxed">
                  {outlet.description}
                </p>

                <div className="mt-auto space-y-3 pt-4 border-t border-border/60">
                  <div className="flex items-start gap-3">
                    <svg
                      className="w-4 h-4 mt-0.5 text-gold shrink-0"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                    <p className="text-sm text-charcoal font-body">{outlet.address}</p>
                  </div>

                  <a
                    href={`tel:${outlet.phone.replace(/\s+/g, "")}`}
                    className="flex items-start gap-3 text-sm text-charcoal hover:text-forest transition-colors duration-200 font-body"
                  >
                    <svg
                      className="w-4 h-4 mt-0.5 text-gold shrink-0"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.37 1.9.72 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.35 1.85.59 2.81.72A2 2 0 0 1 22 16.92z" />
                    </svg>
                    <span>{outlet.phone}</span>
                  </a>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
