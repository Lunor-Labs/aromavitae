"use client";

import Link from "next/link";
import { useState } from "react";

const FOOTER_LINKS = {
  shop: [
    { label: "All Products", href: "/shop" },
    { label: "Spices", href: "/shop/spices" },
    { label: "Perfumes", href: "/shop/perfumes" },
    { label: "Gift Sets", href: "/shop/gift-sets" },
    { label: "New Arrivals", href: "/shop/new" },
    { label: "Best Sellers", href: "/shop/best-sellers" },
  ],
  customerCare: [
    { label: "Shipping & Delivery", href: "/shipping" },
    { label: "Returns & Refunds", href: "/returns" },
    { label: "FAQ", href: "/faq" },
    { label: "Track Your Order", href: "/track" },
    { label: "Terms & Conditions", href: "/terms" },
    { label: "Privacy Policy", href: "/privacy" },
  ],
  about: [
    { label: "Our Story", href: "/our-story" },
    { label: "Heritage", href: "/heritage" },
    { label: "Sustainability", href: "/sustainability" },
    { label: "Journal", href: "/journal" },
    { label: "Contact Us", href: "/contact" },
  ],
};

const SOCIAL_LINKS = [
  {
    label: "Facebook",
    href: "#",
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
      </svg>
    ),
  },
  {
    label: "Instagram",
    href: "#",
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
      </svg>
    ),
  },
  {
    label: "YouTube",
    href: "#",
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
      </svg>
    ),
  },
  {
    label: "LinkedIn",
    href: "#",
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
      </svg>
    ),
  },
];

export function Footer() {
  const [email, setEmail] = useState("");

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    // Newsletter subscription will be connected to Supabase later
    setEmail("");
  };

  return (
    <footer className="bg-forest text-warm-white/80">
      <div className="max-w-[1400px] mx-auto px-6 py-14">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-8">
          {/* Brand Column */}
          <div className="lg:col-span-1">
            <Link href="/" className="block mb-4">
              <span className="font-heading text-xl font-bold text-warm-white tracking-wide">
                AROMAVITAE
              </span>
              <span className="block text-[9px] text-gold tracking-[0.2em] -mt-0.5">
                Nature&apos;s Finest. Ceylon&apos;s Pride.
              </span>
            </Link>
            <p className="text-xs leading-relaxed text-warm-white/60 mb-6">
              Premium spices and Sri Lankan agarwood perfumes, crafted with
              tradition, purity, and passion.
            </p>
            <div className="flex gap-3">
              {SOCIAL_LINKS.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  className="w-9 h-9 rounded-full border border-warm-white/20 flex items-center justify-center
                             text-warm-white/60 hover:text-gold hover:border-gold transition-all duration-200"
                  aria-label={social.label}
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Shop */}
          <div>
            <h3 className="text-xs font-bold text-warm-white tracking-[0.2em] mb-4">
              SHOP
            </h3>
            <ul className="space-y-2.5">
              {FOOTER_LINKS.shop.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-xs text-warm-white/60 hover:text-gold transition-colors duration-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Customer Care */}
          <div>
            <h3 className="text-xs font-bold text-warm-white tracking-[0.2em] mb-4">
              CUSTOMER CARE
            </h3>
            <ul className="space-y-2.5">
              {FOOTER_LINKS.customerCare.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-xs text-warm-white/60 hover:text-gold transition-colors duration-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* About */}
          <div>
            <h3 className="text-xs font-bold text-warm-white tracking-[0.2em] mb-4">
              ABOUT
            </h3>
            <ul className="space-y-2.5">
              {FOOTER_LINKS.about.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-xs text-warm-white/60 hover:text-gold transition-colors duration-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>

            {/* Contact Info */}
            <div className="mt-6 space-y-2">
              <h3 className="text-xs font-bold text-warm-white tracking-[0.2em] mb-3">
                CONTACT
              </h3>
              <div className="flex items-center gap-2 text-xs text-warm-white/60">
                <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                +94 11 234 5678
              </div>
              <div className="flex items-center gap-2 text-xs text-warm-white/60">
                <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                info@aromavitae.lk
              </div>
              <div className="flex items-center gap-2 text-xs text-warm-white/60">
                <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Colombo, Sri Lanka
              </div>
            </div>
          </div>

          {/* Newsletter + Payments */}
          <div>
            <h3 className="text-xs font-bold text-warm-white tracking-[0.2em] mb-4">
              STAY CONNECTED
            </h3>
            <p className="text-xs text-warm-white/60 mb-4 leading-relaxed">
              Subscribe for exclusive offers, new arrivals &amp; stories.
            </p>
            <form onSubmit={handleSubscribe} className="flex mb-6">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Your email address"
                className="flex-1 px-3 py-2.5 bg-transparent border border-warm-white/20 text-xs text-warm-white
                           placeholder:text-warm-white/30 focus:border-gold focus:outline-none transition-colors"
                required
              />
              <button
                type="submit"
                className="px-4 py-2.5 bg-gold text-forest text-xs font-bold tracking-wider
                           hover:bg-gold-light transition-colors duration-200"
              >
                SUBSCRIBE
              </button>
            </form>

            <p className="text-xs font-bold text-warm-white tracking-wider mb-3">
              We Ship Worldwide
            </p>
            {/* Payment Icons */}
            <div className="flex gap-2">
              {["VISA", "MC", "PayPal", "AMEX", "Maestro"].map((p) => (
                <div
                  key={p}
                  className="w-10 h-6 rounded bg-warm-white/10 flex items-center justify-center text-[8px] text-warm-white/50 font-bold"
                >
                  {p}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-warm-white/10">
        <div className="max-w-[1400px] mx-auto px-6 py-4">
          <p className="text-center text-[11px] text-warm-white/40">
            © 2025 Aromavitae (Pvt) Ltd. All Rights Reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
