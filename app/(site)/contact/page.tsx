import type { Metadata } from "next";
import Image from "next/image";
import { PageHero } from "@/components/ui/PageHero";
import { ScrollRevealWrapper } from "@/components/ui/ScrollRevealWrapper";
import { ContactForm } from "@/components/features/contact/ContactForm";

export const metadata: Metadata = {
  title: "Contact Us — Get in Touch",
  description:
    "Reach out to AromaVitae for inquiries about our premium Ceylon spices, agarwood perfumes, custom orders, or wholesale partnerships. We'd love to hear from you.",
  keywords: [
    "contact AromaVitae",
    "Ceylon spice inquiry",
    "wholesale spices Sri Lanka",
    "agarwood perfume order",
  ],
  openGraph: {
    title: "Contact Us — AromaVitae",
    description:
      "Get in touch with us for inquiries about our premium products, wholesale orders, or just to say hello.",
  },
};

const CONTACT_INFO = [
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
        />
      </svg>
    ),
    title: "Phone",
    details: ["+94 77 123 4567", "+94 11 234 5678"],
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
        />
      </svg>
    ),
    title: "Email",
    details: ["info@aromavitae.lk", "orders@aromavitae.lk"],
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
        />
      </svg>
    ),
    title: "Location",
    details: ["Colombo, Sri Lanka", "Worldwide Shipping Available"],
  },
];

const BUSINESS_HOURS = [
  { day: "Monday – Friday", hours: "9:00 AM – 6:00 PM" },
  { day: "Saturday", hours: "10:00 AM – 4:00 PM" },
  { day: "Sunday", hours: "Closed" },
];

export default function ContactPage() {
  return (
    <>
      <PageHero
        title="Contact Us"
        subtitle="Have a question, a custom order, or just want to say hello? We'd love to hear from you."
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Contact Us" },
        ]}
      />

      <ScrollRevealWrapper>
        {/* Contact Info Cards */}
        <section className="py-16 md:py-24 bg-warm-white reveal">
          <div className="max-w-[1400px] mx-auto px-6">
            <div className="grid md:grid-cols-3 gap-6 mb-16">
              {CONTACT_INFO.map((info) => (
                <div
                  key={info.title}
                  className="bg-cream border border-border rounded-lg p-8 text-center
                             hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group"
                >
                  <div className="w-14 h-14 rounded-full bg-forest/10 flex items-center justify-center text-forest mx-auto mb-4 group-hover:bg-forest group-hover:text-warm-white transition-all duration-300">
                    {info.icon}
                  </div>
                  <h3 className="font-heading text-lg font-bold text-charcoal mb-3">
                    {info.title}
                  </h3>
                  {info.details.map((detail) => (
                    <p key={detail} className="text-sm text-muted">
                      {detail}
                    </p>
                  ))}
                </div>
              ))}
            </div>

            {/* Contact Form & Map */}
            <div className="grid lg:grid-cols-5 gap-10">
              {/* Form */}
              <div className="lg:col-span-3" id="contact-form">
                <div className="relative overflow-hidden mb-4" style={{ height: '36px' }}>
                  <Image
                    src="/images/misc/line.png"
                    alt=""
                    fill
                    sizes="(max-width: 1024px) 100vw, 60vw"
                    style={{ objectFit: 'cover', objectPosition: 'center center' }}
                  />
                </div>
                <span className="text-muted text-xs tracking-[0.3em] uppercase font-medium mb-3 block">
                  SEND US A MESSAGE
                </span>
                <h2 className="font-heading text-3xl md:text-4xl font-bold text-charcoal mb-8">
                  Get in Touch
                </h2>
                <ContactForm />
              </div>

              {/* Sidebar */}
              <div className="lg:col-span-2 space-y-8">
                {/* Map Placeholder */}
                <div className="relative bg-cream border border-border rounded-lg overflow-hidden aspect-[4/3] flex items-center justify-center">
                  <div className="text-center p-6">
                    <svg
                      className="w-12 h-12 text-forest/30 mx-auto mb-3"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1}
                        d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
                      />
                    </svg>
                    <p className="font-heading text-lg font-bold text-charcoal mb-1">
                      Colombo, Sri Lanka
                    </p>
                    <p className="text-xs text-muted">
                      AromaVitae Headquarters
                    </p>
                  </div>
                </div>

                {/* Business Hours */}
                <div className="bg-forest text-warm-white rounded-lg p-8">
                  <h3 className="text-xs font-bold text-gold tracking-[0.2em] mb-4">
                    BUSINESS HOURS
                  </h3>
                  <div className="space-y-3">
                    {BUSINESS_HOURS.map((item) => (
                      <div
                        key={item.day}
                        className="flex justify-between text-sm"
                      >
                        <span className="text-warm-white/70">{item.day}</span>
                        <span className="text-warm-white font-medium">
                          {item.hours}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-6 pt-4 border-t border-warm-white/10">
                    <p className="text-xs text-warm-white/50 leading-relaxed">
                      All times are in Sri Lanka Standard Time (GMT+5:30).
                      We aim to respond to all inquiries within 24 hours.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </ScrollRevealWrapper>
    </>
  );
}
