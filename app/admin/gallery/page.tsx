"use client";

import { useCallback, useEffect, useState } from "react";
import { useAdminApi } from "@/hooks/useAdminApi";
import { ImageUploader } from "@/components/admin/ImageUploader";
import { SortableList } from "@/components/admin/SortableList";
import type { GalleryImage } from "@/types/product";
import { AdminThumb } from "@/components/admin/AdminThumb";

// Tags are edited as comma-separated text and parsed on save
type Editing = Partial<Omit<GalleryImage, "tags">> & { tagsText?: string };

const empty: Editing = {
  image: "",
  alt: "",
  tagsText: "",
  span: null,
};

export default function GalleryPage() {
  const { api } = useAdminApi();
  const [items, setItems] = useState<GalleryImage[]>([]);
  const [editing, setEditing] = useState<Editing | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Functional update — two uploads finishing in the same tick would otherwise
  // each spread the same stale `editing` and clobber the other's image.
  const patch = (fields: Editing) =>
    setEditing((prev) => (prev ? { ...prev, ...fields } : prev));

  const reload = useCallback(async () => {
    if (!api) return;
    setLoading(true);
    try {
      const data = await api.get<GalleryImage[]>("/gallery");
      setItems(data);
    } catch {
      // API error — table stays empty
    } finally {
      setLoading(false);
    }
  }, [api]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void reload();
  }, [reload]);

  const startEdit = (g: GalleryImage | null) => {
    setSaveError(null);
    setEditing(
      g
        ? { id: g.id, image: g.image, alt: g.alt, span: g.span ?? null, tagsText: g.tags.join(", ") }
        : { ...empty }
    );
  };

  const save = async () => {
    if (!api || !editing) return;
    setSaveError(null);

    const tags = (editing.tagsText ?? "")
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    const missing: string[] = [];
    if (!editing.image?.trim()) missing.push("Image");
    if (tags.length === 0) missing.push("At least one tag");
    if (missing.length > 0) {
      setSaveError(`Please fill in: ${missing.join(", ")}`);
      return;
    }

    setSaving(true);
    try {
      const payload = {
        image: editing.image,
        alt: editing.alt ?? "",
        tags,
        span: editing.span ?? null,
      };
      if (editing.id) {
        await api.put(`/gallery/${editing.id}`, payload);
      } else {
        await api.post("/gallery", payload);
      }
      setEditing(null);
      void reload();
    } catch (e) {
      setSaveError(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: string) => {
    if (!api) return;
    if (!confirm("Remove this image from the gallery?")) return;
    await api.del(`/gallery/${id}`);
    void reload();
  };

  const onReorder = async (next: GalleryImage[]) => {
    if (!api) return;
    const prev = items;
    setItems(next);
    try {
      await api.patch("/gallery/reorder", { ids: next.map((g) => g.id) });
    } catch {
      setItems(prev);
    }
  };

  if (!api) return <p>Loading…</p>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Gallery</h1>
        <button
          onClick={() => startEdit(null)}
          className="px-4 py-2 bg-forest text-white text-sm rounded hover:bg-forest-light"
        >
          + New image
        </button>
      </div>

      {loading ? <p>Loading…</p> : (
        <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
          <div className="grid grid-cols-[32px_60px_1fr_180px_80px_100px] gap-3 items-center px-3 py-3 bg-slate-50 text-xs uppercase tracking-wider text-slate-600 border-b border-slate-200">
            <span />
            <span>Image</span>
            <span>Alt text</span>
            <span className="hidden sm:block">Tags</span>
            <span className="hidden sm:block">Span</span>
            <span />
          </div>
          <SortableList
            items={items}
            onReorder={onReorder}
            renderItem={(g, sortable) => (
              <div
                ref={sortable.setNodeRef}
                style={sortable.style}
                className="grid grid-cols-[32px_60px_1fr_180px_80px_100px] gap-3 items-center px-3 py-3 border-b border-slate-100 bg-white"
              >
                {sortable.dragHandle}
                <AdminThumb src={g.image} size={40} className="w-10 h-10 object-cover rounded" />
                <span className="truncate text-slate-600">{g.alt || "—"}</span>
                <span className="hidden sm:flex flex-wrap gap-1">
                  {g.tags.map((t) => (
                    <span key={t} className="px-2 py-0.5 bg-slate-100 text-slate-600 text-xs rounded-full">
                      {t}
                    </span>
                  ))}
                </span>
                <span className="text-slate-500 text-xs hidden sm:block">{g.span ?? "normal"}</span>
                <span className="text-right whitespace-nowrap">
                  <button onClick={() => startEdit(g)} className="text-forest text-xs mr-3">
                    Edit
                  </button>
                  <button onClick={() => remove(g.id)} className="text-red-600 text-xs">
                    Delete
                  </button>
                </span>
              </div>
            )}
          />
        </div>
      )}

      {editing && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-semibold mb-4">{editing.id ? "Edit" : "New"} gallery image</h2>
            <div className="space-y-3">
              <ImageUploader api={api} value={editing.image ?? ""} onChange={(v) => patch({ image: v })} label="Image *" />
              <Field label="Alt text" value={editing.alt ?? ""} onChange={(v) => patch({ alt: v })} />
              <Field label="Tags (comma-separated)" required value={editing.tagsText ?? ""} onChange={(v) => patch({ tagsText: v })} />
              <p className="text-xs text-slate-500">
                Visitors filter the gallery by these tags. At least one is required, e.g. &quot;Products, Ingredients&quot;.
              </p>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Layout</label>
                <select
                  value={editing.span ?? ""}
                  onChange={(e) => patch({ span: (e.target.value || null) as Editing["span"] })}
                  className="w-full px-3 py-2 border border-slate-300 rounded text-sm"
                >
                  <option value="">Normal</option>
                  <option value="tall">Tall</option>
                  <option value="wide">Wide</option>
                </select>
              </div>
            </div>
            {saveError && <p className="mt-4 text-sm text-red-600">{saveError}</p>}
            <div className="flex justify-end gap-2 mt-6">
              <button onClick={() => { setEditing(null); setSaveError(null); }} className="px-4 py-2 text-sm" disabled={saving}>Cancel</button>
              <button onClick={save} disabled={saving} className="px-4 py-2 bg-forest text-white text-sm rounded disabled:opacity-50">
                {saving ? "Saving…" : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Field({ label, value, onChange, required }: { label: string; value: string; onChange: (v: string) => void; required?: boolean }) {
  return (
    <div>
      <label className="block text-xs font-medium text-slate-600 mb-1">{label}{required && " *"}</label>
      <input value={value} onChange={(e) => onChange(e.target.value)} required={required} className="w-full px-3 py-2 border border-slate-300 rounded text-sm" />
    </div>
  );
}
