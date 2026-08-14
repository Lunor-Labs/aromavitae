"use client";

import { useCallback, useEffect, useState } from "react";
import { useAdminApi } from "@/hooks/useAdminApi";
import { ImageUploader } from "@/components/admin/ImageUploader";
import { MultiImageUploader } from "@/components/admin/MultiImageUploader";
import { TagInput } from "@/components/admin/TagInput";
import { SortableList } from "@/components/admin/SortableList";
import type { Category, Product } from "@/types/product";

const empty: Omit<Product, "id"> = {
  name: "",
  price: 0,
  currency: "LKR",
  rating: 5,
  reviewCount: 0,
  image: "",
  sideImages: [],
  description: "",
  tags: [],
  isBestSeller: false,
  categoryId: null,
};

export default function ProductsPage() {
  const { api } = useAdminApi();
  const [items, setItems] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [editing, setEditing] = useState<Partial<Product> | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    if (!api) return;
    setLoading(true);
    try {
      const [products, cats] = await Promise.all([
        api.get<Product[]>("/products"),
        api.get<Category[]>("/categories"),
      ]);
      setItems(products);
      setCategories(cats);
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

  const startEdit = (p: Partial<Product>) => {
    setSaveError(null);
    setEditing(p);
  };

  const save = async () => {
    if (!api || !editing) return;
    setSaveError(null);

    const missing: string[] = [];
    if (!editing.name?.trim()) missing.push("Name");
    if (!editing.image?.trim()) missing.push("Main image");
    if (!editing.currency?.trim()) missing.push("Currency");
    if (missing.length > 0) {
      setSaveError(`Please fill in: ${missing.join(", ")}`);
      return;
    }

    setSaving(true);
    try {
      // Build the payload explicitly — `editing` may carry the joined category
      // object and timestamps from the API, which the schema rejects.
      const payload = {
        name: editing.name,
        price: editing.price ?? 0,
        currency: editing.currency ?? "LKR",
        rating: editing.rating ?? 5,
        reviewCount: editing.reviewCount ?? 0,
        image: editing.image,
        sideImages: editing.sideImages ?? [],
        description: editing.description?.trim() ? editing.description : null,
        tags: editing.tags ?? [],
        isBestSeller: editing.isBestSeller ?? false,
        categoryId: editing.categoryId ?? null,
      };
      if (editing.id) {
        await api.put(`/products/${editing.id}`, payload);
      } else {
        await api.post("/products", payload);
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
    if (!confirm("Delete this product?")) return;
    await api.del(`/products/${id}`);
    void reload();
  };

  const onReorder = async (next: Product[]) => {
    if (!api) return;
    const prev = items;
    setItems(next);
    try {
      await api.patch("/products/reorder", { ids: next.map((p) => p.id) });
    } catch {
      setItems(prev);
    }
  };

  if (!api) return <p>Loading…</p>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Products</h1>
        <button
          onClick={() => startEdit({ ...empty })}
          className="px-4 py-2 bg-forest text-white text-sm rounded hover:bg-forest-light"
        >
          + New product
        </button>
      </div>

      {loading ? <p>Loading…</p> : (
        <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
          <div className="grid grid-cols-[32px_60px_1fr_120px_120px_100px] gap-3 items-center px-3 py-3 bg-slate-50 text-xs uppercase tracking-wider text-slate-600 border-b border-slate-200">
            <span />
            <span>Image</span>
            <span>Name</span>
            <span className="hidden sm:block">Category</span>
            <span className="text-right">Price</span>
            <span />
          </div>
          <SortableList
            items={items}
            onReorder={onReorder}
            renderItem={(p, sortable) => (
              <div
                ref={sortable.setNodeRef}
                style={sortable.style}
                className="grid grid-cols-[32px_60px_1fr_120px_120px_100px] gap-3 items-center px-3 py-3 border-b border-slate-100 bg-white"
              >
                {sortable.dragHandle}
                {p.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={p.image} alt="" className="w-10 h-10 object-cover rounded" />
                ) : (
                  <span />
                )}
                <span className="truncate">
                  {p.name}
                  {p.isBestSeller && (
                    <span className="ml-2 px-1.5 py-0.5 bg-gold/15 text-gold text-[10px] rounded uppercase tracking-wide">
                      Best seller
                    </span>
                  )}
                </span>
                <span className="text-slate-600 hidden sm:block truncate">{p.category?.name ?? "—"}</span>
                <span className="text-right whitespace-nowrap">
                  {p.currency} {p.price.toLocaleString()}
                </span>
                <span className="text-right whitespace-nowrap">
                  <button onClick={() => startEdit(p)} className="text-forest text-xs mr-3">
                    Edit
                  </button>
                  <button onClick={() => remove(p.id)} className="text-red-600 text-xs">
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
            <h2 className="text-lg font-semibold mb-4">{editing.id ? "Edit" : "New"} product</h2>
            <div className="space-y-3">
              <Field label="Name" required value={editing.name ?? ""} onChange={(v) => setEditing({ ...editing, name: v })} />
              <NumberField label="Price (LKR)" value={editing.price ?? 0} onChange={(v) => setEditing({ ...editing, price: v })} />
              <Field label="Currency" required value={editing.currency ?? "LKR"} onChange={(v) => setEditing({ ...editing, currency: v })} />
              <NumberField label="Rating (0-5)" value={editing.rating ?? 5} onChange={(v) => setEditing({ ...editing, rating: v })} step={0.5} />
              <NumberField label="Review count" value={editing.reviewCount ?? 0} onChange={(v) => setEditing({ ...editing, reviewCount: v })} />
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Category</label>
                <select
                  value={editing.categoryId ?? ""}
                  onChange={(e) => setEditing({ ...editing, categoryId: e.target.value || null })}
                  className="w-full px-3 py-2 border border-slate-300 rounded text-sm"
                >
                  <option value="">No category</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <TextareaField label="Description" value={editing.description ?? ""} onChange={(v) => setEditing({ ...editing, description: v })} />
              <TagInput values={editing.tags ?? []} onChange={(v) => setEditing({ ...editing, tags: v })} label="Tags (optional)" />
              <label className="flex items-center gap-2 text-sm text-slate-700">
                <input
                  type="checkbox"
                  checked={editing.isBestSeller ?? false}
                  onChange={(e) => setEditing({ ...editing, isBestSeller: e.target.checked })}
                />
                Mark as best seller
              </label>
              <ImageUploader api={api} value={editing.image ?? ""} onChange={(v) => setEditing({ ...editing, image: v })} label="Main image *" />
              <MultiImageUploader
                api={api}
                values={editing.sideImages ?? []}
                onChange={(v) => setEditing({ ...editing, sideImages: v })}
                label="Side images (optional)"
              />
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

function NumberField({ label, value, onChange, step }: { label: string; value: number; onChange: (v: number) => void; step?: number }) {
  return (
    <div>
      <label className="block text-xs font-medium text-slate-600 mb-1">{label}</label>
      <input type="number" step={step ?? 1} value={value} onChange={(e) => onChange(Number(e.target.value))} className="w-full px-3 py-2 border border-slate-300 rounded text-sm" />
    </div>
  );
}

function TextareaField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="block text-xs font-medium text-slate-600 mb-1">{label}</label>
      <textarea value={value} onChange={(e) => onChange(e.target.value)} rows={4} className="w-full px-3 py-2 border border-slate-300 rounded text-sm" />
    </div>
  );
}
