"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useAdminApi } from "@/hooks/useAdminApi";
import { ImageUploader } from "@/components/admin/ImageUploader";
import type { AdminApi } from "@/lib/api";
import type {
  FooterContent,
  AnnouncementContent,
  GiftSetsBannerContent,
} from "@/types/content";

const TITLES: Record<string, string> = {
  footer: "Footer",
  announcement: "Announcement Bar",
  giftSetsBanner: "Gift Sets Banner",
};

const HINTS: Record<string, string> = {
  footer: "Contact details and social media links shown in the footer.",
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
    </div>
  );
}

// ---- Footer ----

const SOCIAL_PLATFORMS: { key: string; label: string; icon: React.ReactNode }[] = [
  { key: "facebook", label: "Facebook", icon: <SocialIcon path="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /> },
  { key: "instagram", label: "Instagram", icon: <SocialIcon path="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" /> },
  { key: "x", label: "X (Twitter)", icon: <SocialIcon path="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /> },
  { key: "youtube", label: "YouTube", icon: <SocialIcon path="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" /> },
  { key: "linkedin", label: "LinkedIn", icon: <SocialIcon path="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" /> },
  { key: "tiktok", label: "TikTok", icon: <SocialIcon path="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" /> },
  { key: "pinterest", label: "Pinterest", icon: <SocialIcon path="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.402.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.354-.629-2.758-1.379l-.749 2.848c-.269 1.045-1.004 2.352-1.498 3.146 1.123.345 2.306.535 3.55.535 6.607 0 11.985-5.365 11.985-11.987C23.97 5.39 18.592.026 11.985.026L12.017 0z" /> },
  { key: "whatsapp", label: "WhatsApp", icon: <SocialIcon path="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" /> },
];

function SocialIcon({ path }: { path: string }) {
  return (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
      <path d={path} />
    </svg>
  );
}

function FooterEditor({ value, onChange }: { value: FooterContent; onChange: (v: unknown) => void }) {
  const v = value ?? ({} as FooterContent);
  const social = v.social ?? [];

  const socialByKey = (key: string) => social.find((s) => s.label === key)?.href ?? "";
  const setSocial = (key: string, href: string) => {
    const others = social.filter((s) => s.label !== key);
    const next = href.trim() ? [...others, { label: key, href }] : others;
    onChange({ ...v, social: next });
  };

  return (
    <div className="space-y-6">
      <div className="border border-slate-200 rounded-lg p-4 space-y-3">
        <p className="text-sm font-medium text-slate-700">Contact</p>
        <Field label="Phone" value={v.contact?.phone ?? ""} onChange={(val) => onChange({ ...v, contact: { ...v.contact, phone: val, email: v.contact?.email ?? "", location: v.contact?.location ?? "" } })} />
        <Field label="Email" value={v.contact?.email ?? ""} onChange={(val) => onChange({ ...v, contact: { ...v.contact, phone: v.contact?.phone ?? "", email: val, location: v.contact?.location ?? "" } })} />
        <Field label="Location" value={v.contact?.location ?? ""} onChange={(val) => onChange({ ...v, contact: { ...v.contact, phone: v.contact?.phone ?? "", email: v.contact?.email ?? "", location: val } })} />
      </div>

      <div>
        <SectionLabel label="Social Links" />
        <p className="text-xs text-slate-500 mb-3">Paste a URL for each platform you want to show. Blank rows are hidden in the footer.</p>
        <div className="space-y-2">
          {SOCIAL_PLATFORMS.map((p) => (
            <div key={p.key} className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 border border-slate-200 rounded-lg px-3 py-2">
              <div className="flex items-center gap-3 sm:w-40 shrink-0">
                <span className="w-8 h-8 shrink-0 flex items-center justify-center text-slate-600">{p.icon}</span>
                <span className="text-sm text-slate-700">{p.label}</span>
              </div>
              <input
                value={socialByKey(p.key)}
                onChange={(e) => setSocial(p.key, e.target.value)}
                placeholder={`Full URL or domain (e.g. ${p.key}.com/aromavitae)`}
                className="flex-1 w-full min-w-0 px-3 py-2 border border-slate-300 rounded text-sm focus:outline-none focus:border-forest"
              />
            </div>
          ))}
        </div>
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
