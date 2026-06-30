"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useAdminApi } from "@/hooks/useAdminApi";

const TITLES: Record<string, string> = {
  hero: "Hero Carousel",
  story: "Story & Heritage",
  navbar: "Navbar",
  footer: "Footer",
  announcement: "Announcement Bar",
  giftSetsBanner: "Gift Sets Banner",
};

const HINTS: Record<string, string> = {
  hero: "Slides shown in the hero carousel. Each slide has a heading, subheading, image, and two CTAs.",
  story: "The dual-panel Our Story / Heritage section. `badges.icon` must be one of: book, leaf, shield.",
  navbar: "Top navigation. Links may have a `children` array for dropdowns.",
  footer: "Footer columns, contact info, social links, payments, copyright.",
  announcement: "Marquee messages at the top of the page.",
  giftSetsBanner: "Mid-page banner promoting gift sets.",
};

export function SingletonEditClient() {
  const params = useParams<{ key: string }>();
  const key = params.key;
  const { api } = useAdminApi();

  const [json, setJson] = useState("");
  const [original, setOriginal] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "saving" | "saved" | "error">("loading");
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!api) return;
    setStatus("loading");
    try {
      const row = await api.get<{ key: string; data: unknown; updatedAt: string }>(`/singletons/${key}`);
      const pretty = JSON.stringify(row.data ?? {}, null, 2);
      setJson(pretty);
      setOriginal(pretty);
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
    let parsed: unknown;
    try {
      parsed = JSON.parse(json);
    } catch {
      setError("Invalid JSON");
      return;
    }
    setStatus("saving");
    try {
      await api.put(`/singletons/${key}`, parsed);
      setOriginal(json);
      setStatus("saved");
      setTimeout(() => setStatus("idle"), 1500);
    } catch (e) {
      setStatus("error");
      setError(e instanceof Error ? e.message : "Save failed");
    }
  };

  const dirty = json !== original;

  if (!api) return <p>Loading…</p>;

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-1">{TITLES[key] ?? key}</h1>
      <p className="text-sm text-slate-500 mb-6">{HINTS[key] ?? ""}</p>

      {status === "loading" ? <p>Loading…</p> : (
        <>
          <textarea
            value={json}
            onChange={(e) => setJson(e.target.value)}
            spellCheck={false}
            className="w-full h-[60vh] font-mono text-xs p-4 bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-forest"
          />
          <div className="flex items-center justify-between mt-4">
            <div className="text-sm">
              {error && <span className="text-red-600">{error}</span>}
              {!error && status === "saved" && <span className="text-green-600">Saved.</span>}
              {!error && status === "saving" && <span className="text-slate-500">Saving…</span>}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setJson(original)}
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
