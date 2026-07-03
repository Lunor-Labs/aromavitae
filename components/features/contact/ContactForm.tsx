"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

interface FormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

const INITIAL_FORM: FormData = {
  name: "",
  email: "",
  subject: "",
  message: "",
};

export function ContactForm() {
  const [form, setForm] = useState<FormData>(INITIAL_FORM);
  const [submitted, setSubmitted] = useState(false);
  const [focused, setFocused] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setForm(INITIAL_FORM);
    // Reset success state after 5 seconds
    setTimeout(() => setSubmitted(false), 5000);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const inputClasses = (name: string) =>
    cn(
      "w-full px-4 py-3 bg-cream/50 border rounded-lg text-sm text-charcoal",
      "placeholder:text-muted/50 transition-all duration-300 outline-none",
      focused === name
        ? "border-forest ring-2 ring-forest/10 bg-warm-white"
        : "border-border hover:border-forest/40"
    );

  if (submitted) {
    return (
      <div className="bg-forest/5 border border-forest/20 rounded-lg p-10 text-center animate-fade-in">
        <div className="w-16 h-16 rounded-full bg-forest/10 flex items-center justify-center mx-auto mb-4">
          <svg
            className="w-8 h-8 text-forest"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <h3 className="font-heading text-xl font-bold text-charcoal mb-2">
          Message Sent!
        </h3>
        <p className="text-sm text-muted">
          Thank you for reaching out. We&apos;ll get back to you within 24 hours.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid sm:grid-cols-2 gap-5">
        <div>
          <label
            htmlFor="contact-name"
            className="block text-xs font-medium text-charcoal tracking-wider mb-2"
          >
            YOUR NAME *
          </label>
          <input
            id="contact-name"
            name="name"
            type="text"
            value={form.name}
            onChange={handleChange}
            onFocus={() => setFocused("name")}
            onBlur={() => setFocused(null)}
            placeholder="e.g. John Doe"
            className={inputClasses("name")}
            required
          />
        </div>
        <div>
          <label
            htmlFor="contact-email"
            className="block text-xs font-medium text-charcoal tracking-wider mb-2"
          >
            EMAIL ADDRESS *
          </label>
          <input
            id="contact-email"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            onFocus={() => setFocused("email")}
            onBlur={() => setFocused(null)}
            placeholder="e.g. john@example.com"
            className={inputClasses("email")}
            required
          />
        </div>
      </div>

      <div>
        <label
          htmlFor="contact-subject"
          className="block text-xs font-medium text-charcoal tracking-wider mb-2"
        >
          SUBJECT *
        </label>
        <select
          id="contact-subject"
          name="subject"
          value={form.subject}
          onChange={handleChange}
          onFocus={() => setFocused("subject")}
          onBlur={() => setFocused(null)}
          className={inputClasses("subject")}
          required
        >
          <option value="">Select a subject...</option>
          <option value="general">General Inquiry</option>
          <option value="products">Product Information</option>
          <option value="wholesale">Wholesale / Bulk Orders</option>
          <option value="custom">Custom Orders</option>
          <option value="shipping">Shipping & Delivery</option>
          <option value="other">Other</option>
        </select>
      </div>

      <div>
        <label
          htmlFor="contact-message"
          className="block text-xs font-medium text-charcoal tracking-wider mb-2"
        >
          MESSAGE *
        </label>
        <textarea
          id="contact-message"
          name="message"
          value={form.message}
          onChange={handleChange}
          onFocus={() => setFocused("message")}
          onBlur={() => setFocused(null)}
          placeholder="Tell us how we can help..."
          rows={6}
          className={cn(inputClasses("message"), "resize-none")}
          required
        />
      </div>

      <button
        type="submit"
        className="px-8 py-3.5 bg-forest text-warm-white text-xs font-medium tracking-[0.2em]
                   rounded-lg border border-gold/20 hover:bg-forest-light hover:border-gold/40
                   transition-all duration-300 w-full sm:w-auto"
      >
        SEND MESSAGE
      </button>
    </form>
  );
}
