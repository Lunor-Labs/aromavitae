"use client";

import { useCallback, useEffect, useState } from "react";
import { useAdminApi } from "@/hooks/useAdminApi";
import { ImageUploader } from "@/components/admin/ImageUploader";
import { SortableList, DragHandle } from "@/components/admin/SortableList";
import type { Outlet } from "@/types/product";

const empty: Omit<Outlet, "id"> = {
  name: "",
  address: "",
  phone: "",
  description: "",
  image: "",
  sortOrder: 0,
};

export default function OutletsPage() {
  const { api } = useAdminApi();
  const [items, setItems] = useState<Outlet[]>([]);
  const [editing, setEditing] = useState<Partial<Outlet> | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    if (!api) return;
    setLoading(true);
    try {
      setItems(await api.get<Outlet[]>("/outlets"));
    } catch {
      // API error — table stays empty
    } finally {
      setLoading(false);
    }
  }, [api]);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { void reload(); }, [reload]);

  const startEdit = (o: Partial<Outlet>) => {
    setSaveError(null);
    setEditing(o);
  };

  const save = async () => {
    if (!api || !editing) return;
    setSaveError(null);

    const missing: string[] = [];
    if (!editing.name?.trim()) missing.push("Name");
    if (!editing.address?.trim()) missing.push("Address");
    if (!editing.phone?.trim()) missing.push("Phone");
    if (!editing.description?.trim()) missing.push("Description");
    if (!editing.image?.trim()) missing.push("Store photo");
    if (missing.length > 0) {
      setSaveError(`Please fill in: ${missing.join(", ")}`);
      return;
    }

    setSaving(true);
    try {
      const { id, ...rest } = editing;
      if (id) await api.put(`/outlets/${id}`, rest);
      else await api.post("/outlets", rest);
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
    await api.del(`/outlets/${id}`);
    void reload();
  };

  const onReorder = async (next: Outlet[]) => {
    if (!api) return;
    const prev = items;
    setItems(next);
    try {
      await api.patch("/outlets/reorder", { ids: next.map((o) => o.id) });
    } catch {
      setItems(prev);
    }
  };

  if (!api) return <p>Loading…</p>;

  return (
    <div>
      <div className="flex justify-between mb-6">
        <h1 className="text-2xl font-semibold">Outlets</h1>
        <button onClick={() => startEdit({ ...empty })} className="px-4 py-2 bg-forest text-white text-sm rounded">+ New</button>
      </div>

      {loading ? <p>Loading…</p> : (
        <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
          <div className="grid grid-cols-[32px_60px_1fr_1fr_120px_100px] gap-3 items-center px-3 py-3 bg-slate-50 text-xs uppercase tracking-wider text-slate-600 border-b border-slate-200">
            <span />
            <span>Image</span>
            <span>Name</span>
            <span className="hidden md:block">Address</span>
            <span className="hidden sm:block">Phone</span>
            <span />
          </div>
          <SortableList
            items={items}
            onReorder={onReorder}
            renderItem={(o, sortable) => (
              <div
                ref={sortable.setNodeRef}
                style={sortable.style}
                className="grid grid-cols-[32px_60px_1fr_1fr_120px_100px] gap-3 items-center px-3 py-3 border-b border-slate-100 bg-white"
              >
                <DragHandle handle={sortable.handle} />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={o.image} alt="" className="w-10 h-10 object-cover rounded" />
                <span className="truncate">{o.name}</span>
                <span className="text-slate-600 hidden md:block truncate">{o.address}</span>
                <span className="text-slate-600 hidden sm:block whitespace-nowrap truncate">{o.phone}</span>
                <span className="text-right whitespace-nowrap">
                  <button onClick={() => startEdit(o)} className="text-forest text-xs mr-3">Edit</button>
                  <button onClick={() => remove(o.id)} className="text-red-600 text-xs">Delete</button>
                </span>
              </div>
            )}
          />
        </div>
      )}

      {editing && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-semibold mb-4">{editing.id ? "Edit" : "New"} outlet</h2>
            <div className="space-y-3">
              <Field label="Name" required value={editing.name ?? ""} onChange={(v) => setEditing({ ...editing, name: v })} />
              <Field label="Address" required value={editing.address ?? ""} onChange={(v) => setEditing({ ...editing, address: v })} />
              <Field label="Phone" required value={editing.phone ?? ""} onChange={(v) => setEditing({ ...editing, phone: v })} />
              <TextareaField label="Description" required value={editing.description ?? ""} onChange={(v) => setEditing({ ...editing, description: v })} />
              <ImageUploader api={api} value={editing.image ?? ""} onChange={(v) => setEditing({ ...editing, image: v })} label="Store photo *" />
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
function TextareaField({ label, value, onChange, required }: { label: string; value: string; onChange: (v: string) => void; required?: boolean }) {
  return (
    <div>
      <label className="block text-xs font-medium text-slate-600 mb-1">{label}{required && " *"}</label>
      <textarea value={value} onChange={(e) => onChange(e.target.value)} rows={4} required={required} className="w-full px-3 py-2 border border-slate-300 rounded text-sm resize-y" />
    </div>
  );
}
