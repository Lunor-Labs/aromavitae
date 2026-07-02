"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useAdminApi } from "@/hooks/useAdminApi";
import { ImageUploader } from "@/components/admin/ImageUploader";
import type { AdminApi } from "@/lib/api";
import type {
  HeroContent, HeroSlide,
  StoryContent, StoryPanel,
  NavbarContent, NavLinkItem,
  FooterContent,
  AnnouncementContent,
  GiftSetsBannerContent,
  CtaLink,
} from "@/types/content";

const TITLES: Record<string, string> = {
  hero: "Hero Carousel",
  story: "Story & Heritage",
  navbar: "Navbar",
  footer: "Footer",
  announcement: "Announcement Bar",
  giftSetsBanner: "Gift Sets Banner",
};

const HINTS: Record<string, string> = {
  hero: "Slides shown in the hero carousel.",
  story: "The dual-panel Our Story / Heritage section.",
  navbar: "Top navigation links and brand.",
  footer: "Footer columns, contact, social, and legal.",
  announcement: "Marquee messages shown at the top of the page.",
  giftSetsBanner: "Mid-page banner promoting gift sets.",
};

export function SingletonEditClient() {
  const params = useParams<{ key: string }>();
  const key = params.key;
  const { api } = useAdminApi();

  const [data, setData] = useState<unknown>(null);
  const [original, setOriginal] = useState<string>("");
  const [status, setStatus] = useState<"idle" | "loading" | "saving" | "saved" | "error">("loading");
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!api) return;
    setStatus("loading");
    try {
      const row = await api.get<{ key: string; data: unknown; updatedAt: string }>(`/singletons/${key}`);
      setData(row.data ?? {});
      setOriginal(JSON.stringify(row.data ?? {}));
      setStatus("idle");
    } catch (e) {
      setStatus("error");
      setError(e instanceof Error ? e.message : "Failed to load");
    }
  }, [api, key]);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { void load(); }, [load]);

  const save = async () => {
    if (!api) return;
    setError(null);
    setStatus("saving");
    try {
      await api.put(`/singletons/${key}`, data);
      setOriginal(JSON.stringify(data));
      setStatus("saved");
      setTimeout(() => setStatus("idle"), 1500);
    } catch (e) {
      setStatus("error");
      setError(e instanceof Error ? e.message : "Save failed");
    }
  };

  const dirty = JSON.stringify(data) !== original;

  if (!api) return <p>Loading…</p>;

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-1">{TITLES[key] ?? key}</h1>
      <p className="text-sm text-slate-500 mb-6">{HINTS[key] ?? ""}</p>

      {status === "loading" ? <p>Loading…</p> : (
        <>
          <div className="bg-white border border-slate-200 rounded-lg p-6">
            {renderEditor(key, data, setData, api)}
          </div>
          <div className="flex items-center justify-between mt-4">
            <div className="text-sm">
              {error && <span className="text-red-600">{error}</span>}
              {!error && status === "saved" && <span className="text-green-600">Saved.</span>}
              {!error && status === "saving" && <span className="text-slate-500">Saving…</span>}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => { setData(JSON.parse(original)); }}
                disabled={!dirty}
                className="px-4 py-2 text-sm border border-slate-300 rounded disabled:opacity-50"
              >
                Revert
              </button>
              <button
                onClick={save}
                disabled={!dirty || status === "saving"}
                className="px-4 py-2 text-sm bg-forest text-white rounded disabled:opacity-50"
              >
                Save
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function renderEditor(key: string, data: unknown, setData: (v: unknown) => void, api: AdminApi) {
  switch (key) {
    case "announcement":
      return <AnnouncementEditor value={data as AnnouncementContent} onChange={setData} />;
    case "giftSetsBanner":
      return <GiftSetsBannerEditor value={data as GiftSetsBannerContent} onChange={setData} api={api} />;
    case "hero":
      return <HeroEditor value={data as HeroContent} onChange={setData} api={api} />;
    case "story":
      return <StoryEditor value={data as StoryContent} onChange={setData} />;
    case "navbar":
      return <NavbarEditor value={data as NavbarContent} onChange={setData} />;
    case "footer":
      return <FooterEditor value={data as FooterContent} onChange={setData} />;
    default:
      return (
        <textarea
          value={JSON.stringify(data, null, 2)}
          onChange={(e) => {
            try { setData(JSON.parse(e.target.value)); } catch { /* ignore parse errors */ }
          }}
          spellCheck={false}
          className="w-full h-[60vh] font-mono text-xs p-0 border-0 focus:outline-none"
        />
      );
  }
}

// ---- Announcement ----

function AnnouncementEditor({ value, onChange }: { value: AnnouncementContent; onChange: (v: unknown) => void }) {
  const msgs = value?.messages ?? [];
  const update = (messages: string[]) => onChange({ ...value, messages });

  return (
    <div className="space-y-3">
      <SectionLabel label="Messages" />
      {msgs.map((m, i) => (
        <div key={i} className="flex gap-2">
          <input
            value={m}
            onChange={(e) => { const next = [...msgs]; next[i] = e.target.value; update(next); }}
            className="flex-1 px-3 py-2 border border-slate-300 rounded text-sm focus:outline-none focus:border-forest"
            placeholder="Announcement message…"
          />
          <RemoveButton onClick={() => update(msgs.filter((_, j) => j !== i))} />
        </div>
      ))}
      <AddButton onClick={() => update([...msgs, ""])} label="Add message" />
    </div>
  );
}

// ---- Gift Sets Banner ----

function GiftSetsBannerEditor({ value, onChange, api }: { value: GiftSetsBannerContent; onChange: (v: unknown) => void; api: AdminApi }) {
  const v = value ?? ({} as GiftSetsBannerContent);
  const set = (patch: Partial<GiftSetsBannerContent>) => onChange({ ...v, ...patch });

  return (
    <div className="space-y-4">
      <Field label="Eyebrow" value={v.eyebrow ?? ""} onChange={(val) => set({ eyebrow: val })} />
      <Field label="Heading" value={v.heading ?? ""} onChange={(val) => set({ heading: val })} />
      <TextareaField label="Body" value={v.body ?? ""} onChange={(val) => set({ body: val })} />
      <ImageUploader api={api} value={v.image ?? ""} onChange={(url) => set({ image: url })} label="Image" />
      <div className="grid grid-cols-2 gap-3">
        <Field label="CTA Label" value={v.ctaLabel ?? ""} onChange={(val) => set({ ctaLabel: val })} />
        <Field label="CTA Link (href)" value={v.ctaHref ?? ""} onChange={(val) => set({ ctaHref: val })} />
      </div>
    </div>
  );
}

// ---- Hero ----

const defaultSlide: HeroSlide = {
  heading: "",
  subheading: "",
  image: "",
  ctaPrimary: { label: "", href: "" },
  ctaSecondary: { label: "", href: "" },
};

function HeroEditor({ value, onChange, api }: { value: HeroContent; onChange: (v: unknown) => void; api: AdminApi }) {
  const v = value ?? { slides: [], autoPlayMs: 6000 };
  const slides = v.slides ?? [];
  const setSlides = (s: HeroSlide[]) => onChange({ ...v, slides: s });

  return (
    <div className="space-y-6">
      <NumberField
        label="Auto-play interval (ms)"
        value={v.autoPlayMs ?? 6000}
        onChange={(n) => onChange({ ...v, autoPlayMs: n })}
      />

      <div>
        <SectionLabel label="Slides" />
        <div className="space-y-4">
          {slides.map((slide, i) => (
            <div key={i} className="border border-slate-200 rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-700">Slide {i + 1}</span>
                <RemoveButton onClick={() => setSlides(slides.filter((_, j) => j !== i))} />
              </div>
              <Field
                label="Heading"
                value={slide.heading}
                onChange={(val) => { const next = [...slides]; next[i] = { ...slide, heading: val }; setSlides(next); }}
              />
              <Field
                label="Subheading"
                value={slide.subheading}
                onChange={(val) => { const next = [...slides]; next[i] = { ...slide, subheading: val }; setSlides(next); }}
              />
              <ImageUploader
                api={api}
                value={slide.image}
                onChange={(url) => { const next = [...slides]; next[i] = { ...slide, image: url }; setSlides(next); }}
              />
              <div className="grid grid-cols-2 gap-4 pt-1">
                <div className="space-y-2">
                  <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Primary CTA</p>
                  <Field
                    label="Label"
                    value={slide.ctaPrimary.label}
                    onChange={(val) => { const next = [...slides]; next[i] = { ...slide, ctaPrimary: { ...slide.ctaPrimary, label: val } }; setSlides(next); }}
                  />
                  <Field
                    label="Link (href)"
                    value={slide.ctaPrimary.href}
                    onChange={(val) => { const next = [...slides]; next[i] = { ...slide, ctaPrimary: { ...slide.ctaPrimary, href: val } }; setSlides(next); }}
                  />
                </div>
                <div className="space-y-2">
                  <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Secondary CTA</p>
                  <Field
                    label="Label"
                    value={slide.ctaSecondary.label}
                    onChange={(val) => { const next = [...slides]; next[i] = { ...slide, ctaSecondary: { ...slide.ctaSecondary, label: val } }; setSlides(next); }}
                  />
                  <Field
                    label="Link (href)"
                    value={slide.ctaSecondary.href}
                    onChange={(val) => { const next = [...slides]; next[i] = { ...slide, ctaSecondary: { ...slide.ctaSecondary, href: val } }; setSlides(next); }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
        <AddButton onClick={() => setSlides([...slides, { ...defaultSlide, ctaPrimary: { ...defaultSlide.ctaPrimary }, ctaSecondary: { ...defaultSlide.ctaSecondary } }])} label="Add slide" />
      </div>
    </div>
  );
}

// ---- Story ----

function StoryPanelSection({ label, value, onChange }: { label: string; value: StoryPanel; onChange: (v: StoryPanel) => void }) {
  return (
    <div className="border border-slate-200 rounded-lg p-4 space-y-3">
      <p className="text-sm font-medium text-slate-700">{label}</p>
      <Field label="Eyebrow" value={value?.eyebrow ?? ""} onChange={(val) => onChange({ ...value, eyebrow: val })} />
      <Field label="Heading" value={value?.heading ?? ""} onChange={(val) => onChange({ ...value, heading: val })} />
      <TextareaField label="Body" value={value?.body ?? ""} onChange={(val) => onChange({ ...value, body: val })} />
      <div className="grid grid-cols-2 gap-3">
        <Field label="CTA Label" value={value?.ctaLabel ?? ""} onChange={(val) => onChange({ ...value, ctaLabel: val })} />
        <Field label="CTA Link (href)" value={value?.ctaHref ?? ""} onChange={(val) => onChange({ ...value, ctaHref: val })} />
      </div>
    </div>
  );
}

function StoryEditor({ value, onChange }: { value: StoryContent; onChange: (v: unknown) => void }) {
  const v = value ?? { ourStory: {} as StoryPanel, heritage: { eyebrow: "", heading: "", body: "", ctaLabel: "", ctaHref: "", badges: [] } };
  const heritage = v.heritage ?? { eyebrow: "", heading: "", body: "", ctaLabel: "", ctaHref: "", badges: [] };

  return (
    <div className="space-y-6">
      <StoryPanelSection
        label="Our Story"
        value={v.ourStory}
        onChange={(panel) => onChange({ ...v, ourStory: panel })}
      />

      <div className="border border-slate-200 rounded-lg p-4 space-y-3">
        <p className="text-sm font-medium text-slate-700">Heritage</p>
        <Field label="Eyebrow" value={heritage.eyebrow ?? ""} onChange={(val) => onChange({ ...v, heritage: { ...heritage, eyebrow: val } })} />
        <Field label="Heading" value={heritage.heading ?? ""} onChange={(val) => onChange({ ...v, heritage: { ...heritage, heading: val } })} />
        <TextareaField label="Body" value={heritage.body ?? ""} onChange={(val) => onChange({ ...v, heritage: { ...heritage, body: val } })} />
        <div className="grid grid-cols-2 gap-3">
          <Field label="CTA Label" value={heritage.ctaLabel ?? ""} onChange={(val) => onChange({ ...v, heritage: { ...heritage, ctaLabel: val } })} />
          <Field label="CTA Link (href)" value={heritage.ctaHref ?? ""} onChange={(val) => onChange({ ...v, heritage: { ...heritage, ctaHref: val } })} />
        </div>

        <div className="pt-2">
          <SectionLabel label="Badges" />
          <div className="space-y-2">
            {(heritage.badges ?? []).map((badge, i) => (
              <div key={i} className="flex gap-2 items-end">
                <div className="flex-1 grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Icon</label>
                    <select
                      value={badge.icon}
                      onChange={(e) => {
                        const badges = [...heritage.badges];
                        badges[i] = { ...badge, icon: e.target.value };
                        onChange({ ...v, heritage: { ...heritage, badges } });
                      }}
                      className="w-full px-3 py-2 border border-slate-300 rounded text-sm focus:outline-none focus:border-forest"
                    >
                      <option value="book">book</option>
                      <option value="leaf">leaf</option>
                      <option value="shield">shield</option>
                    </select>
                  </div>
                  <Field
                    label="Label"
                    value={badge.label}
                    onChange={(val) => {
                      const badges = [...heritage.badges];
                      badges[i] = { ...badge, label: val };
                      onChange({ ...v, heritage: { ...heritage, badges } });
                    }}
                  />
                </div>
                <RemoveButton onClick={() => {
                  const badges = heritage.badges.filter((_, j) => j !== i);
                  onChange({ ...v, heritage: { ...heritage, badges } });
                }} />
              </div>
            ))}
            <AddButton
              onClick={() => onChange({ ...v, heritage: { ...heritage, badges: [...(heritage.badges ?? []), { icon: "leaf", label: "" }] } })}
              label="Add badge"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// ---- Navbar ----

function NavbarEditor({ value, onChange }: { value: NavbarContent; onChange: (v: unknown) => void }) {
  const v = value ?? { brand: { name: "", tagline: "" }, links: [], cta: { label: "", href: "" } };
  const links = v.links ?? [];

  return (
    <div className="space-y-6">
      <div className="border border-slate-200 rounded-lg p-4 space-y-3">
        <p className="text-sm font-medium text-slate-700">Brand</p>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Name" value={v.brand?.name ?? ""} onChange={(val) => onChange({ ...v, brand: { ...v.brand, name: val } })} />
          <Field label="Tagline" value={v.brand?.tagline ?? ""} onChange={(val) => onChange({ ...v, brand: { ...v.brand, tagline: val } })} />
        </div>
      </div>

      <div>
        <SectionLabel label="Navigation Links" />
        <div className="space-y-3">
          {links.map((link, i) => {
            const updateLink = (patch: Partial<NavLinkItem>) => {
              const next = [...links];
              next[i] = { ...link, ...patch };
              onChange({ ...v, links: next });
            };

            return (
              <div key={i} className="border border-slate-200 rounded-lg p-3 space-y-2">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium text-slate-500">Link {i + 1}</span>
                  <RemoveButton onClick={() => onChange({ ...v, links: links.filter((_, j) => j !== i) })} />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Field label="Label" value={link.label} onChange={(val) => updateLink({ label: val })} />
                  <Field label="Href" value={link.href} onChange={(val) => updateLink({ href: val })} />
                </div>

                {link.children !== undefined && (
                  <div className="mt-2 ml-2 border-l-2 border-slate-100 pl-3 space-y-2">
                    <p className="text-xs text-slate-400 font-medium">Dropdown items</p>
                    {link.children.map((child, ci) => (
                      <div key={ci} className="flex gap-2 items-end">
                        <div className="flex-1 grid grid-cols-2 gap-2">
                          <Field label="Label" value={child.label} onChange={(val) => {
                            const children = [...(link.children ?? [])];
                            children[ci] = { ...child, label: val };
                            updateLink({ children });
                          }} />
                          <Field label="Href" value={child.href} onChange={(val) => {
                            const children = [...(link.children ?? [])];
                            children[ci] = { ...child, href: val };
                            updateLink({ children });
                          }} />
                        </div>
                        <RemoveButton onClick={() => updateLink({ children: link.children!.filter((_, cj) => cj !== ci) })} />
                      </div>
                    ))}
                    <button
                      onClick={() => updateLink({ children: [...(link.children ?? []), { label: "", href: "" }] })}
                      className="text-xs text-forest hover:underline"
                    >
                      + Add item
                    </button>
                  </div>
                )}

                {link.children === undefined && (
                  <button
                    onClick={() => updateLink({ children: [] })}
                    className="text-xs text-slate-400 hover:text-forest mt-1"
                  >
                    + Add dropdown
                  </button>
                )}
              </div>
            );
          })}
        </div>
        <AddButton onClick={() => onChange({ ...v, links: [...links, { label: "", href: "" }] })} label="Add link" />
      </div>

      <div className="border border-slate-200 rounded-lg p-4 space-y-3">
        <p className="text-sm font-medium text-slate-700">CTA Button</p>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Label" value={v.cta?.label ?? ""} onChange={(val) => onChange({ ...v, cta: { ...v.cta, label: val } })} />
          <Field label="Href" value={v.cta?.href ?? ""} onChange={(val) => onChange({ ...v, cta: { ...v.cta, href: val } })} />
        </div>
      </div>
    </div>
  );
}

// ---- Footer ----

function FooterEditor({ value, onChange }: { value: FooterContent; onChange: (v: unknown) => void }) {
  const v = value ?? ({} as FooterContent);
  const columns = v.columns ?? [];
  const social = v.social ?? [];
  const payments = v.payments ?? [];

  return (
    <div className="space-y-6">
      <div className="border border-slate-200 rounded-lg p-4 space-y-3">
        <p className="text-sm font-medium text-slate-700">Brand</p>
        <Field label="Name" value={v.brand?.name ?? ""} onChange={(val) => onChange({ ...v, brand: { ...v.brand, name: val } })} />
        <Field label="Tagline" value={v.brand?.tagline ?? ""} onChange={(val) => onChange({ ...v, brand: { ...v.brand, tagline: val } })} />
        <TextareaField label="Description" value={v.brand?.description ?? ""} onChange={(val) => onChange({ ...v, brand: { ...v.brand, description: val } })} />
      </div>

      <div>
        <SectionLabel label="Footer Columns" />
        <div className="space-y-4">
          {columns.map((col, ci) => (
            <div key={ci} className="border border-slate-200 rounded-lg p-4 space-y-3">
              <div className="flex items-end gap-2">
                <div className="flex-1">
                  <Field label="Column Title" value={col.title} onChange={(val) => {
                    const next = [...columns]; next[ci] = { ...col, title: val }; onChange({ ...v, columns: next });
                  }} />
                </div>
                <RemoveButton onClick={() => onChange({ ...v, columns: columns.filter((_, j) => j !== ci) })} />
              </div>
              <div className="space-y-2">
                {col.links.map((link, li) => (
                  <div key={li} className="flex gap-2 items-end">
                    <div className="flex-1 grid grid-cols-2 gap-2">
                      <Field label="Label" value={link.label} onChange={(val) => {
                        const next = [...columns];
                        const links = [...col.links]; links[li] = { ...link, label: val };
                        next[ci] = { ...col, links }; onChange({ ...v, columns: next });
                      }} />
                      <Field label="Href" value={link.href} onChange={(val) => {
                        const next = [...columns];
                        const links = [...col.links]; links[li] = { ...link, href: val };
                        next[ci] = { ...col, links }; onChange({ ...v, columns: next });
                      }} />
                    </div>
                    <RemoveButton onClick={() => {
                      const next = [...columns];
                      next[ci] = { ...col, links: col.links.filter((_, j) => j !== li) };
                      onChange({ ...v, columns: next });
                    }} />
                  </div>
                ))}
                <button
                  onClick={() => {
                    const next = [...columns];
                    next[ci] = { ...col, links: [...col.links, { label: "", href: "" }] };
                    onChange({ ...v, columns: next });
                  }}
                  className="text-xs text-forest hover:underline"
                >
                  + Add link
                </button>
              </div>
            </div>
          ))}
        </div>
        <AddButton onClick={() => onChange({ ...v, columns: [...columns, { title: "", links: [] }] })} label="Add column" />
      </div>

      <div className="border border-slate-200 rounded-lg p-4 space-y-3">
        <p className="text-sm font-medium text-slate-700">Contact</p>
        <Field label="Phone" value={v.contact?.phone ?? ""} onChange={(val) => onChange({ ...v, contact: { ...v.contact, phone: val } })} />
        <Field label="Email" value={v.contact?.email ?? ""} onChange={(val) => onChange({ ...v, contact: { ...v.contact, email: val } })} />
        <Field label="Location" value={v.contact?.location ?? ""} onChange={(val) => onChange({ ...v, contact: { ...v.contact, location: val } })} />
      </div>

      <div className="border border-slate-200 rounded-lg p-4 space-y-3">
        <p className="text-sm font-medium text-slate-700">Newsletter</p>
        <Field label="Title" value={v.newsletter?.title ?? ""} onChange={(val) => onChange({ ...v, newsletter: { ...v.newsletter, title: val } })} />
        <Field label="Body" value={v.newsletter?.body ?? ""} onChange={(val) => onChange({ ...v, newsletter: { ...v.newsletter, body: val } })} />
      </div>

      <div>
        <SectionLabel label="Social Links" />
        <div className="space-y-2">
          {social.map((s, i) => (
            <div key={i} className="flex gap-2 items-end">
              <div className="flex-1 grid grid-cols-2 gap-2">
                <Field label="Label" value={s.label} onChange={(val) => {
                  const next = [...social]; next[i] = { ...s, label: val }; onChange({ ...v, social: next });
                }} />
                <Field label="Href" value={s.href} onChange={(val) => {
                  const next = [...social]; next[i] = { ...s, href: val }; onChange({ ...v, social: next });
                }} />
              </div>
              <RemoveButton onClick={() => onChange({ ...v, social: social.filter((_, j) => j !== i) })} />
            </div>
          ))}
          <AddButton onClick={() => onChange({ ...v, social: [...social, { label: "", href: "" }] })} label="Add social link" />
        </div>
      </div>

      <div>
        <SectionLabel label="Payment Methods" />
        <div className="space-y-2">
          {payments.map((p, i) => (
            <div key={i} className="flex gap-2">
              <input
                value={p}
                onChange={(e) => { const next = [...payments]; next[i] = e.target.value; onChange({ ...v, payments: next }); }}
                className="flex-1 px-3 py-2 border border-slate-300 rounded text-sm focus:outline-none focus:border-forest"
                placeholder="e.g. visa"
              />
              <RemoveButton onClick={() => onChange({ ...v, payments: payments.filter((_, j) => j !== i) })} />
            </div>
          ))}
          <AddButton onClick={() => onChange({ ...v, payments: [...payments, ""] })} label="Add payment method" />
        </div>
      </div>

      <div className="border border-slate-200 rounded-lg p-4">
        <Field label="Copyright text" value={v.legal?.copyright ?? ""} onChange={(val) => onChange({ ...v, legal: { copyright: val } })} />
      </div>
    </div>
  );
}

// ---- Shared helpers ----

function Field({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="block text-xs font-medium text-slate-600 mb-1">{label}</label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 border border-slate-300 rounded text-sm focus:outline-none focus:border-forest"
      />
    </div>
  );
}

function TextareaField({ label, value, onChange, rows = 3 }: { label: string; value: string; onChange: (v: string) => void; rows?: number }) {
  return (
    <div>
      <label className="block text-xs font-medium text-slate-600 mb-1">{label}</label>
      <textarea
        rows={rows}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 border border-slate-300 rounded text-sm focus:outline-none focus:border-forest resize-none"
      />
    </div>
  );
}

function NumberField({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <div>
      <label className="block text-xs font-medium text-slate-600 mb-1">{label}</label>
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full px-3 py-2 border border-slate-300 rounded text-sm focus:outline-none focus:border-forest"
      />
    </div>
  );
}

function SectionLabel({ label }: { label: string }) {
  return <p className="text-sm font-medium text-slate-700 mb-2">{label}</p>;
}

function AddButton({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <button
      onClick={onClick}
      className="mt-2 text-xs text-forest border border-forest/40 rounded px-3 py-1.5 hover:bg-forest/5 transition-colors"
    >
      + {label}
    </button>
  );
}

function RemoveButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="px-2 text-slate-400 hover:text-red-600 text-lg leading-none shrink-0 transition-colors"
      title="Remove"
    >
      ×
    </button>
  );
}
