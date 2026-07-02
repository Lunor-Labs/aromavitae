"use client";

import { useCallback, useEffect, useState } from "react";
import { useAdminApi } from "@/hooks/useAdminApi";
import { ImageUploader } from "@/components/admin/ImageUploader";
import type { Product } from "@/types/product";

const empty: Omit<Product, "id"> = {
  name: "",
  price: 0,
  currency: "LKR",
  rating: 5,
  reviewCount: 0,
  image: "",
  category: "spices",
  badge: "",
};

export default function ProductsPage() {
  const { api } = useAdminApi();
  const [items, setItems] = useState<Product[]>([]);
  const [editing, setEditing] = useState<Partial<Product> | null>(null);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    if (!api) return;
    setLoading(true);
    try {
      const data = await api.get<Product[]>("/products");
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

  const save = async () => {
    if (!api || !editing) return;
    const { id, ...rest } = editing;
    if (id) {
      await api.put(`/products/${id}`, rest);
    } else {
      await api.post("/products", rest);
    }
    setEditing(null);
    void reload();
  };

  const remove = async (id: string) => {
    if (!api) return;
    if (!confirm("Delete this product?")) return;
    await api.del(`/products/${id}`);
    void reload();
  };

  if (!api) return <p>Loading…</p>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Products</h1>
        <button
          onClick={() => setEditing({ ...empty })}
          className="px-4 py-2 bg-forest text-white text-sm rounded hover:bg-forest-light"
        >
          + New product
        </button>
      </div>

      {loading ? <p>Loading…</p> : (
        <table className="w-full bg-white border border-slate-200 rounded-lg overflow-hidden text-sm">
          <thead className="bg-slate-50 text-slate-600 text-xs uppercase tracking-wider">
            <tr>
              <th className="text-left p-3">Image</th>
              <th className="text-left p-3">Name</th>
              <th className="text-left p-3">Category</th>
              <th className="text-right p-3">Price</th>
              <th className="text-right p-3">Order</th>
              <th className="p-3" />
            </tr>
          </thead>
          <tbody>
            {items.map((p) => (
              <tr key={p.id} className="border-t border-slate-100">
                <td className="p-3">
                  {p.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={p.image} alt="" className="w-10 h-10 object-cover rounded" />
                  ) : null}
                </td>
                <td className="p-3">{p.name}</td>
                <td className="p-3 text-slate-600">{p.category}</td>
                <td className="p-3 text-right">{p.currency} {p.price.toLocaleString()}</td>
                <td className="p-3 text-right text-slate-500">{(p as Product & { sortOrder?: number }).sortOrder ?? 0}</td>
                <td className="p-3 text-right">
                  <button onClick={() => setEditing(p)} className="text-forest text-xs mr-3">Edit</button>
                  <button onClick={() => remove(p.id)} className="text-red-600 text-xs">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {editing && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-semibold mb-4">{editing.id ? "Edit" : "New"} product</h2>
            <div className="space-y-3">
              <Field label="Name" value={editing.name ?? ""} onChange={(v) => setEditing({ ...editing, name: v })} />
              <NumberField label="Price (LKR)" value={editing.price ?? 0} onChange={(v) => setEditing({ ...editing, price: v })} />
              <Field label="Currency" value={editing.currency ?? "LKR"} onChange={(v) => setEditing({ ...editing, currency: v })} />
              <NumberField label="Rating (0-5)" value={editing.rating ?? 5} onChange={(v) => setEditing({ ...editing, rating: v })} step={0.5} />
              <NumberField label="Review count" value={editing.reviewCount ?? 0} onChange={(v) => setEditing({ ...editing, reviewCount: v })} />
              <Field label="Category" value={editing.category ?? ""} onChange={(v) => setEditing({ ...editing, category: v })} />
              <Field label="Badge (optional)" value={editing.badge ?? ""} onChange={(v) => setEditing({ ...editing, badge: v })} />
              <ImageUploader api={api} value={editing.image ?? ""} onChange={(v) => setEditing({ ...editing, image: v })} />
              <NumberField label="Sort order" value={(editing as { sortOrder?: number }).sortOrder ?? 0} onChange={(v) => setEditing({ ...editing, ...{ sortOrder: v } } as Partial<Product>)} />
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button onClick={() => setEditing(null)} className="px-4 py-2 text-sm">Cancel</button>
              <button onClick={save} className="px-4 py-2 bg-forest text-white text-sm rounded">Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="block text-xs font-medium text-slate-600 mb-1">{label}</label>
      <input value={value} onChange={(e) => onChange(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded text-sm" />
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
