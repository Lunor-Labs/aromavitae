"use client";

import { useCallback, useEffect, useState } from "react";
import { useAdminApi } from "@/hooks/useAdminApi";
import { ImageUploader } from "@/components/admin/ImageUploader";
import type { Category } from "@/types/product";

const empty: Omit<Category, "id"> = { name: "", image: "", href: "" };

export default function CategoriesPage() {
  const { api } = useAdminApi();
  const [items, setItems] = useState<Category[]>([]);
  const [editing, setEditing] = useState<Partial<Category> | null>(null);

  const reload = useCallback(async () => {
    if (!api) return;
    setItems(await api.get<Category[]>("/categories"));
  }, [api]);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { void reload(); }, [reload]);
//comment
  const save = async () => {
    if (!api || !editing) return;
    const { id, ...rest } = editing;
    if (id) await api.put(`/categories/${id}`, rest);
    else await api.post("/categories", rest);
    setEditing(null);
    void reload();
  };

  const remove = async (id: string) => {
    if (!api || !confirm("Delete?")) return;
    await api.del(`/categories/${id}`);
    void reload();
  };

  if (!api) return <p>Loading…</p>;

  return (
    <div>
      <div className="flex justify-between mb-6">
        <h1 className="text-2xl font-semibold">Categories</h1>
        <button onClick={() => setEditing({ ...empty })} className="px-4 py-2 bg-forest text-white text-sm rounded">+ New</button>
      </div>

      <table className="w-full bg-white border border-slate-200 rounded-lg text-sm">
        <thead className="bg-slate-50 text-xs uppercase text-slate-600">
          <tr>
            <th className="text-left p-3">Image</th>
            <th className="text-left p-3">Name</th>
            <th className="text-left p-3">Link</th>
            <th className="p-3" />
          </tr>
        </thead>
        <tbody>
          {items.map((c) => (
            <tr key={c.id} className="border-t border-slate-100">
              <td className="p-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={c.image} alt="" className="w-10 h-10 object-cover rounded" />
              </td>
              <td className="p-3">{c.name}</td>
              <td className="p-3 text-slate-600">{c.href}</td>
              <td className="p-3 text-right">
                <button onClick={() => setEditing(c)} className="text-forest text-xs mr-3">Edit</button>
                <button onClick={() => remove(c.id)} className="text-red-600 text-xs">Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {editing && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg">
            <h2 className="text-lg font-semibold mb-4">{editing.id ? "Edit" : "New"} category</h2>
            <div className="space-y-3">
              <Field label="Name" value={editing.name ?? ""} onChange={(v) => setEditing({ ...editing, name: v })} />
              <Field label="Link href" value={editing.href ?? ""} onChange={(v) => setEditing({ ...editing, href: v })} />
              <ImageUploader api={api} value={editing.image ?? ""} onChange={(v) => setEditing({ ...editing, image: v })} />
              <NumberField label="Sort order" value={(editing as { sortOrder?: number }).sortOrder ?? 0} onChange={(v) => setEditing({ ...editing, ...{ sortOrder: v } } as Partial<Category>)} />
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
function NumberField({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <div>
      <label className="block text-xs font-medium text-slate-600 mb-1">{label}</label>
      <input type="number" value={value} onChange={(e) => onChange(Number(e.target.value))} className="w-full px-3 py-2 border border-slate-300 rounded text-sm" />
    </div>
  );
}
