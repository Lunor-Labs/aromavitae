"use client";

import { useState } from "react";
import { AdminApi } from "@/lib/api";

interface SignedUrlResponse {
  uploadUrl: string;
  path: string;
  publicUrl: string;
}

interface Props {
  api: AdminApi;
  values: string[];
  onChange: (urls: string[]) => void;
  label?: string;
}

/** Ordered list of image URLs with move/remove controls plus upload/paste-URL appenders. */
export function MultiImageUploader({ api, values, onChange, label = "Images" }: Props) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [urlDraft, setUrlDraft] = useState("");

  const move = (from: number, to: number) => {
    if (to < 0 || to >= values.length) return;
    const next = [...values];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    onChange(next);
  };

  const handleFile = async (file: File) => {
    setError(null);
    setUploading(true);
    try {
      const signed = await api.post<SignedUrlResponse>("/uploads/signed-url", {
        filename: file.name,
        contentType: file.type,
      });
      const put = await fetch(signed.uploadUrl, {
        method: "PUT",
        headers: { "Content-Type": file.type },
        body: file,
      });
      if (!put.ok) throw new Error(`Upload failed (${put.status})`);
      onChange([...values, signed.publicUrl]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const addUrl = () => {
    const url = urlDraft.trim();
    if (!url) return;
    onChange([...values, url]);
    setUrlDraft("");
  };

  return (
    <div>
      <label className="block text-xs font-medium text-slate-600 mb-1">{label}</label>
      {values.length > 0 && (
        <ul className="space-y-2 mb-2">
          {values.map((url, i) => (
            <li key={`${url}-${i}`} className="flex items-center gap-3 border border-slate-200 rounded p-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt="" className="w-12 h-12 object-cover rounded border border-slate-200" />
              <span className="flex-1 text-xs text-slate-500 truncate">{url}</span>
              <button type="button" onClick={() => move(i, i - 1)} disabled={i === 0} className="text-slate-500 disabled:opacity-30 px-1" aria-label="Move up">↑</button>
              <button type="button" onClick={() => move(i, i + 1)} disabled={i === values.length - 1} className="text-slate-500 disabled:opacity-30 px-1" aria-label="Move down">↓</button>
              <button type="button" onClick={() => onChange(values.filter((_, j) => j !== i))} className="text-red-600 text-xs px-1">Remove</button>
            </li>
          ))}
        </ul>
      )}
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={urlDraft}
          onChange={(e) => setUrlDraft(e.target.value)}
          placeholder="Image URL"
          className="flex-1 px-3 py-2 border border-slate-300 rounded text-sm focus:outline-none focus:border-forest"
        />
        <button
          type="button"
          onClick={addUrl}
          disabled={!urlDraft.trim()}
          className="px-3 py-2 text-sm border border-slate-300 rounded disabled:opacity-40"
        >
          Add
        </button>
      </div>
      <input
        type="file"
        accept="image/*"
        disabled={uploading}
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) handleFile(f);
          e.target.value = "";
        }}
        className="mt-1 text-xs"
      />
      {uploading && <p className="text-xs text-slate-500 mt-1">Uploading…</p>}
      {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
    </div>
  );
}
