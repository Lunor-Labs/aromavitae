"use client";

import { useCallback, useEffect, useState } from "react";
import { useAdminApi } from "@/hooks/useAdminApi";
import { ImageUploader } from "@/components/admin/ImageUploader";
import { RichTextEditor } from "@/components/admin/RichTextEditor";
import { SortableList } from "@/components/admin/SortableList";
import { slugify } from "@/lib/utils";
import type { BlogCategory, BlogPost } from "@/types/product";
import { AdminThumb } from "@/components/admin/AdminThumb";

const empty: Omit<BlogPost, "id" | "category"> = {
  title: "",
  slug: "",
  excerpt: "",
  content: "",
  coverImage: "",
  categoryId: null,
  isFeatured: false,
  publishedAt: new Date().toISOString(),
};

export default function BlogPostsPage() {
  const { api } = useAdminApi();
  const [items, setItems] = useState<BlogPost[]>([]);
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [editing, setEditing] = useState<Partial<BlogPost> | null>(null);
  const [slugTouched, setSlugTouched] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Functional update — two uploads finishing in the same tick would otherwise
  // each spread the same stale `editing` and clobber the other's image.
  const patch = (fields: Partial<BlogPost>) =>
    setEditing((prev) => (prev ? { ...prev, ...fields } : prev));

  const reload = useCallback(async () => {
    if (!api) return;
    setLoading(true);
    try {
      const [posts, cats] = await Promise.all([
        api.get<BlogPost[]>("/blog-posts"),
        api.get<BlogCategory[]>("/blog-categories"),
      ]);
      setItems(posts);
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

  const startEdit = (p: Partial<BlogPost>) => {
    setSaveError(null);
    setSlugTouched(Boolean(p.id));
    setEditing(p);
  };

  const onTitleChange = (title: string) => {
    setEditing((prev) => ({
      ...prev,
      title,
      slug: slugTouched ? prev?.slug : slugify(title),
    }));
  };

  const save = async () => {
    if (!api || !editing) return;
    setSaveError(null);

    const missing: string[] = [];
    if (!editing.title?.trim()) missing.push("Title");
    if (!editing.slug?.trim()) missing.push("Slug");
    if (!editing.excerpt?.trim()) missing.push("Excerpt");
    if (!editing.content?.trim()) missing.push("Content");
    if (!editing.coverImage?.trim()) missing.push("Cover image");
    if (missing.length > 0) {
      setSaveError(`Please fill in: ${missing.join(", ")}`);
      return;
    }

    setSaving(true);
    try {
      const payload = {
        title: editing.title,
        slug: editing.slug,
        excerpt: editing.excerpt,
        content: editing.content,
        coverImage: editing.coverImage,
        categoryId: editing.categoryId ?? null,
        isFeatured: editing.isFeatured ?? false,
        publishedAt: editing.publishedAt ?? new Date().toISOString(),
      };
      if (editing.id) {
        await api.put(`/blog-posts/${editing.id}`, payload);
      } else {
        await api.post("/blog-posts", payload);
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
    if (!confirm("Delete this blog post?")) return;
    await api.del(`/blog-posts/${id}`);
    void reload();
  };

  const onReorder = async (next: BlogPost[]) => {
    if (!api) return;
    const prev = items;
    setItems(next);
    try {
      await api.patch("/blog-posts/reorder", { ids: next.map((p) => p.id) });
    } catch {
      setItems(prev);
    }
  };

  if (!api) return <p>Loading…</p>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Blog Posts</h1>
        <button
          onClick={() => startEdit({ ...empty })}
          className="px-4 py-2 bg-forest text-white text-sm rounded hover:bg-forest-light"
        >
          + New post
        </button>
      </div>

      {loading ? <p>Loading…</p> : (
        <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
          <div className="grid grid-cols-[32px_60px_1fr_120px_100px] gap-3 items-center px-3 py-3 bg-slate-50 text-xs uppercase tracking-wider text-slate-600 border-b border-slate-200">
            <span />
            <span>Image</span>
            <span>Title</span>
            <span className="hidden sm:block">Category</span>
            <span />
          </div>
          <SortableList
            items={items}
            onReorder={onReorder}
            renderItem={(p, sortable) => (
              <div
                ref={sortable.setNodeRef}
                style={sortable.style}
                className="grid grid-cols-[32px_60px_1fr_120px_100px] gap-3 items-center px-3 py-3 border-b border-slate-100 bg-white"
              >
                {sortable.dragHandle}
                {p.coverImage ? (
                  <AdminThumb src={p.coverImage} size={40} className="w-10 h-10 object-cover rounded" />
                ) : (
                  <span />
                )}
                <span className="truncate">
                  {p.title}
                  {p.isFeatured && (
                    <span className="ml-2 px-1.5 py-0.5 bg-gold/15 text-gold text-[10px] rounded uppercase tracking-wide">
                      Featured
                    </span>
                  )}
                </span>
                <span className="text-slate-600 hidden sm:block truncate">{p.category?.name ?? "—"}</span>
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
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-semibold mb-4">{editing.id ? "Edit" : "New"} blog post</h2>
            <div className="space-y-3">
              <Field label="Title" required value={editing.title ?? ""} onChange={onTitleChange} />
              <div>
                <Field
                  label="Slug"
                  required
                  value={editing.slug ?? ""}
                  onChange={(v) => {
                    setSlugTouched(true);
                    patch({ slug: slugify(v) });
                  }}
                />
                <p className="text-xs text-slate-500 mt-1">
                  Used in the URL: /blog/{editing.slug || "your-post-slug"}
                </p>
              </div>
              <TextareaField label="Excerpt" required value={editing.excerpt ?? ""} onChange={(v) => patch({ excerpt: v })} rows={3} />
              <RichTextEditor value={editing.content ?? ""} onChange={(v) => patch({ content: v })} />
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Category</label>
                <select
                  value={editing.categoryId ?? ""}
                  onChange={(e) => patch({ categoryId: e.target.value || null })}
                  className="w-full px-3 py-2 border border-slate-300 rounded text-sm"
                >
                  <option value="">No category</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Published date</label>
                <input
                  type="date"
                  value={(editing.publishedAt ?? new Date().toISOString()).slice(0, 10)}
                  onChange={(e) => patch({ publishedAt: new Date(e.target.value).toISOString() })}
                  className="w-full px-3 py-2 border border-slate-300 rounded text-sm"
                />
              </div>
              <label className="flex items-center gap-2 text-sm text-slate-700">
                <input
                  type="checkbox"
                  checked={editing.isFeatured ?? false}
                  onChange={(e) => patch({ isFeatured: e.target.checked })}
                />
                Feature this post at the top of the blog
              </label>
              <ImageUploader api={api} value={editing.coverImage ?? ""} onChange={(v) => patch({ coverImage: v })} label="Cover image *" />
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

function TextareaField({ label, value, onChange, required, rows }: { label: string; value: string; onChange: (v: string) => void; required?: boolean; rows?: number }) {
  return (
    <div>
      <label className="block text-xs font-medium text-slate-600 mb-1">{label}{required && " *"}</label>
      <textarea value={value} onChange={(e) => onChange(e.target.value)} rows={rows ?? 4} className="w-full px-3 py-2 border border-slate-300 rounded text-sm" />
    </div>
  );
}
