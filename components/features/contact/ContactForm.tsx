"use client";

import { useState } from "react";
import { BRAND_NAME } from "@/lib/site";
import { cn } from "@/lib/utils";

/**
 * Messages are emailed by Web3Forms straight from the browser. The access key
 * decides where they land: it must be created for the email shown in the
 * footer (Contact Details), and replaced with a new one if that email changes.
 */
const WEB3FORMS_ENDPOINT = "https://api.web3forms.com/submit";
const ACCESS_KEY = process.env.NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY;

const TOPICS = [
  { value: "general", label: "General Inquiry" },
  { value: "products", label: "Product Information" },
  { value: "wholesale", label: "Wholesale / Bulk Orders" },
  { value: "custom", label: "Custom Orders" },
  { value: "shipping", label: "Shipping & Delivery" },
  { value: "other", label: "Other" },
];

interface FormData {
  name: string;
  email: string;
  topic: string;
  message: string;
}

const INITIAL_FORM: FormData = {
  name: "",
  email: "",
  topic: "",
  message: "",
};

type Status = "idle" | "submitting" | "success" | "error";

interface Props {
  /** The shop's email from Contact Details, offered when sending fails. */
  email: string;
}

export function ContactForm({ email }: Props) {
  const [form, setForm] = useState<FormData>(INITIAL_FORM);
  const [status, setStatus] = useState<Status>("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [focused, setFocused] = useState<string | null>(null);

  const fail = (message: string) => {
    setStatus("error");
    setErrorMessage(message);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!ACCESS_KEY) {
      fail(`Our contact form isn't available right now. Please email us at ${email}.`);
      return;
    }

    const botcheck = new window.FormData(e.currentTarget).get("botcheck");
    const topic = TOPICS.find((t) => t.value === form.topic)?.label ?? form.topic;

    setStatus("submitting");
    try {
      const response = await fetch(WEB3FORMS_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        // Key order here is the order the fields appear in the email. Replies
        // go to the customer, since Web3Forms uses `email` as the reply-to.
        // (`subject` is reserved by Web3Forms for the email's subject line,
        // which is why the form's own "Subject" is sent as `topic`.)
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          topic,
          message: form.message,
          access_key: ACCESS_KEY,
          subject: `${topic} — message from ${form.name}`,
          from_name: `${BRAND_NAME} Website`,
          botcheck: Boolean(botcheck),
        }),
      });
      const result = await response.json();

      if (result.success) {
        setStatus("success");
        setForm(INITIAL_FORM);
      } else {
        fail(result.message || `Something went wrong. Please try again, or email us at ${email}.`);
      }
    } catch {
      fail(`We couldn't send your message. Please check your connection and try again, or email us at ${email}.`);
    }
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

  if (status === "success") {
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
        <p className="text-sm text-muted mb-6">
          Thank you for reaching out. We&apos;ll get back to you within 24 hours.
        </p>
        <button
          type="button"
          onClick={() => setStatus("idle")}
          className="text-xs font-medium tracking-[0.2em] text-forest hover:text-forest-light underline underline-offset-4"
        >
          SEND ANOTHER MESSAGE
        </button>
      </div>
    );
  }

  const submitting = status === "submitting";

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Honeypot for spam bots, hidden from real visitors */}
      <input
        type="checkbox"
        name="botcheck"
        className="hidden"
        style={{ display: "none" }}
        tabIndex={-1}
        autoComplete="off"
      />

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
            autoComplete="name"
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
            autoComplete="email"
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
          htmlFor="contact-topic"
          className="block text-xs font-medium text-charcoal tracking-wider mb-2"
        >
          SUBJECT *
        </label>
        <select
          id="contact-topic"
          name="topic"
          value={form.topic}
          onChange={handleChange}
          onFocus={() => setFocused("topic")}
          onBlur={() => setFocused(null)}
          className={inputClasses("topic")}
          required
        >
          <option value="">Select a subject...</option>
          {TOPICS.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
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

      {status === "error" && (
        <p
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {errorMessage}
        </p>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="px-8 py-3.5 bg-forest text-warm-white text-xs font-medium tracking-[0.2em]
                   rounded-lg border border-gold/20 hover:bg-forest-light hover:border-gold/40
                   transition-all duration-300 w-full sm:w-auto
                   disabled:cursor-not-allowed disabled:opacity-70"
      >
        {submitting ? "SENDING..." : "SEND MESSAGE"}
      </button>
    </form>
  );
}
