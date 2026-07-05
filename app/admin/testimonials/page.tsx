"use client";

import { useCallback, useEffect, useState } from "react";
import { useAdminApi } from "@/hooks/useAdminApi";
import { SortableList, DragHandle } from "@/components/admin/SortableList";
import type { Testimonial } from "@/types/product";

const empty: Omit<Testimonial, "id"> = { quote: "", author: "", location: "", rating: 5 };

export default function TestimonialsPage() {
  const { api } = useAdminApi();
  const [items, setItems] = useState<Testimonial[]>([]);
  const [editing, setEditing] = useState<Partial<Testimonial> | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    if (!api) return;
    setLoading(true);
    try {
      setItems(await api.get<Testimonial[]>("/testimonials"));
    } catch {
      // API error — stays empty
    } finally {
      setLoading(false);
    }
  }, [api]);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { void reload(); }, [reload]);

  const startEdit = (t: Partial<Testimonial>) => {
    setSaveError(null);
    setEditing(t);
  };

  const save = async () => {
    if (!api || !editing) return;
    setSaveError(null);

    const missing: string[] = [];
    if (!editing.quote?.trim()) missing.push("Quote");
    if (!editing.author?.trim()) missing.push("Author");
    if (!editing.location?.trim()) missing.push("Location");
    if (missing.length > 0) {
      setSaveError(`Please fill in: ${missing.join(", ")}`);
      return;
    }

    setSaving(true);
    try {
      const { id, ...rest } = editing;
      if (id) await api.put(`/testimonials/${id}`, rest);
      else await api.post("/testimonials", rest);
      setEditing(null);
      void reload();
    } catch (e) {
      setSaveError(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: string) => {
    if (!api || !confirm("Delete?")) return;
    await api.del(`/testimonials/${id}`);
    void reload();
  };

  const onReorder = async (next: Testimonial[]) => {
    if (!api) return;
    const prev = items;
    setItems(next);
    try {
      await api.patch("/testimonials/reorder", { ids: next.map((t) => t.id) });
    } catch {
      setItems(prev);
    }
  };

  if (!api) return <p>Loading…</p>;

  return (
    <div>
      <div className="flex justify-between mb-6">
        <h1 className="text-2xl font-semibold">Testimonials</h1>
        <button onClick={() => startEdit({ ...empty })} className="px-4 py-2 bg-forest text-white text-sm rounded">+ New</button>
      </div>

      {loading ? <p>Loading…</p> : (
        <div className="space-y-3">
          <SortableList
            items={items}
            onReorder={onReorder}
            renderItem={(t, sortable) => (
              <div
                ref={sortable.setNodeRef}
                style={sortable.style}
                className="bg-white border border-slate-200 rounded-lg p-4 flex justify-between items-start gap-4"
              >
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div className="pt-1">
                    <DragHandle handle={sortable.handle} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm italic text-slate-700 mb-2">&ldquo;{t.quote}&rdquo;</p>
                    <p className="text-xs text-slate-500">— {t.author}, {t.location} · {t.rating}★</p>
                  </div>
                </div>
                <div className="shrink-0">
                  <button onClick={() => startEdit(t)} className="text-forest text-xs mr-3">Edit</button>
                  <button onClick={() => remove(t.id)} className="text-red-600 text-xs">Delete</button>
                </div>
              </div>
            )}
          />
        </div>
      )}

      {editing && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg">
            <h2 className="text-lg font-semibold mb-4">{editing.id ? "Edit" : "New"} testimonial</h2>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Quote *</label>
                <textarea
                  rows={5}
                  required
                  value={editing.quote ?? ""}
                  onChange={(e) => setEditing({ ...editing, quote: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded text-sm"
                />
              </div>
              <Field label="Author" required value={editing.author ?? ""} onChange={(v) => setEditing({ ...editing, author: v })} />
              <Field label="Location" required value={editing.location ?? ""} onChange={(v) => setEditing({ ...editing, location: v })} />
              <NumberField label="Rating (1-5)" value={editing.rating ?? 5} onChange={(v) => setEditing({ ...editing, rating: v })} />
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
function NumberField({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <div>
      <label className="block text-xs font-medium text-slate-600 mb-1">{label}</label>
      <input type="number" value={value} onChange={(e) => onChange(Number(e.target.value))} className="w-full px-3 py-2 border border-slate-300 rounded text-sm" />
    </div>
  );
}
