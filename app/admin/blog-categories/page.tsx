"use client";

import { useCallback, useEffect, useState } from "react";
import { useAdminApi } from "@/hooks/useAdminApi";
import { SortableList } from "@/components/admin/SortableList";
import type { BlogCategory } from "@/types/product";

const empty: Omit<BlogCategory, "id"> = { name: "" };

export default function BlogCategoriesPage() {
  const { api } = useAdminApi();
  const [items, setItems] = useState<BlogCategory[]>([]);
  const [editing, setEditing] = useState<Partial<BlogCategory> | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Functional update — two uploads finishing in the same tick would otherwise
  // each spread the same stale `editing` and clobber the other's image.
  const patch = (fields: Partial<BlogCategory>) =>
    setEditing((prev) => (prev ? { ...prev, ...fields } : prev));

  const reload = useCallback(async () => {
    if (!api) return;
    setLoading(true);
    try {
      const data = await api.get<BlogCategory[]>("/blog-categories");
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

  const startEdit = (c: Partial<BlogCategory>) => {
    setSaveError(null);
    setEditing(c);
  };

  const save = async () => {
    if (!api || !editing) return;
    setSaveError(null);

    if (!editing.name?.trim()) {
      setSaveError("Please fill in: Name");
      return;
    }

    setSaving(true);
    try {
      const payload = { name: editing.name };
      if (editing.id) {
        await api.put(`/blog-categories/${editing.id}`, payload);
      } else {
        await api.post("/blog-categories", payload);
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
    if (!confirm("Delete this blog category? Its posts become uncategorized.")) return;
    await api.del(`/blog-categories/${id}`);
    void reload();
  };

  const onReorder = async (next: BlogCategory[]) => {
    if (!api) return;
    const prev = items;
    setItems(next);
    try {
      await api.patch("/blog-categories/reorder", { ids: next.map((c) => c.id) });
    } catch {
      setItems(prev);
    }
  };

  if (!api) return <p>Loading…</p>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Blog Categories</h1>
        <button
          onClick={() => startEdit({ ...empty })}
          className="px-4 py-2 bg-forest text-white text-sm rounded hover:bg-forest-light"
        >
          + New category
        </button>
      </div>

      {loading ? <p>Loading…</p> : (
        <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
          <div className="grid grid-cols-[32px_1fr_100px] gap-3 items-center px-3 py-3 bg-slate-50 text-xs uppercase tracking-wider text-slate-600 border-b border-slate-200">
            <span />
            <span>Name</span>
            <span />
          </div>
          <SortableList
            items={items}
            onReorder={onReorder}
            renderItem={(c, sortable) => (
              <div
                ref={sortable.setNodeRef}
                style={sortable.style}
                className="grid grid-cols-[32px_1fr_100px] gap-3 items-center px-3 py-3 border-b border-slate-100 bg-white"
              >
                {sortable.dragHandle}
                <span className="truncate">{c.name}</span>
                <span className="text-right whitespace-nowrap">
                  <button onClick={() => startEdit(c)} className="text-forest text-xs mr-3">
                    Edit
                  </button>
                  <button onClick={() => remove(c.id)} className="text-red-600 text-xs">
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
            <h2 className="text-lg font-semibold mb-4">{editing.id ? "Edit" : "New"} blog category</h2>
            <div className="space-y-3">
              <Field label="Name" required value={editing.name ?? ""} onChange={(v) => patch({ name: v })} />
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
