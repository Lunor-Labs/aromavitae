"use client";

import { useState } from "react";
import { AdminApi } from "@/lib/api";
import { AdminThumb } from "@/components/admin/AdminThumb";
import { uploadImage, describeRejection } from "@/lib/uploadImage";

interface Props {
  api: AdminApi;
  values: string[];
  onChange: (urls: string[]) => void;
  label?: string;
  /** Server schema caps `sideImages` at 10 — stop the user here rather than failing on save. */
  max?: number;
}

/** How many uploads run at once. Keeps a 10-file batch quick without flooding the API rate limit. */
const CONCURRENCY = 3;

/** Ordered list of image URLs with move/remove controls plus upload/paste-URL appenders. */
export function MultiImageUploader({ api, values, onChange, label = "Images", max = 10 }: Props) {
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [urlDraft, setUrlDraft] = useState("");

  const uploading = progress !== null;
  const remaining = max - values.length;

  const move = (from: number, to: number) => {
    if (to < 0 || to >= values.length) return;
    const next = [...values];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    onChange(next);
  };

  /**
   * Uploads a whole selection and appends the results in one `onChange`.
   *
   * Calling `onChange` per file would drop images: each call spreads the
   * `values` captured when this handler started, so every upload after the
   * first would overwrite its predecessor's addition.
   */
  const handleFiles = async (files: File[]) => {
    setError(null);

    const problems: string[] = [];
    const accepted: File[] = [];
    for (const file of files) {
      const rejection = describeRejection(file);
      if (rejection) problems.push(rejection);
      else accepted.push(file);
    }

    if (accepted.length > remaining) {
      problems.push(
        `Only ${remaining} more image${remaining === 1 ? "" : "s"} allowed (max ${max}) — extras were skipped.`
      );
      accepted.length = Math.max(remaining, 0);
    }

    if (accepted.length === 0) {
      setError(problems.join(" ") || "Nothing to upload.");
      return;
    }

    // Results are written by index so the saved order matches the pick order
    // even though uploads finish out of order.
    const uploaded = new Array<string | null>(accepted.length).fill(null);
    let done = 0;
    setProgress({ done: 0, total: accepted.length });

    let next = 0;
    const worker = async () => {
      while (next < accepted.length) {
        const i = next++;
        const file = accepted[i];
        try {
          uploaded[i] = await uploadImage(api, file);
        } catch (e) {
          problems.push(`${file.name}: ${e instanceof Error ? e.message : "upload failed"}`);
        }
        done++;
        setProgress({ done, total: accepted.length });
      }
    };

    try {
      await Promise.all(
        Array.from({ length: Math.min(CONCURRENCY, accepted.length) }, worker)
      );
      // Keep whatever succeeded — a single bad file shouldn't discard the batch.
      const succeeded = uploaded.filter((u): u is string => u !== null);
      if (succeeded.length > 0) onChange([...values, ...succeeded]);
      setError(problems.length > 0 ? problems.join(" ") : null);
    } finally {
      setProgress(null);
    }
  };

  const addUrl = () => {
    const url = urlDraft.trim();
    if (!url) return;
    if (remaining <= 0) {
      setError(`Maximum of ${max} images reached.`);
      return;
    }
    onChange([...values, url]);
    setUrlDraft("");
  };

  return (
    <div>
      <label className="block text-xs font-medium text-slate-600 mb-1">
        {label} <span className="text-slate-400">({values.length}/{max})</span>
      </label>
      {values.length > 0 && (
        <ul className="space-y-2 mb-2">
          {values.map((url, i) => (
            <li key={`${url}-${i}`} className="flex items-center gap-3 border border-slate-200 rounded p-2">
              <AdminThumb src={url} size={48} className="w-12 h-12 object-cover rounded border border-slate-200" />
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
          disabled={!urlDraft.trim() || remaining <= 0}
          className="px-3 py-2 text-sm border border-slate-300 rounded disabled:opacity-40"
        >
          Add
        </button>
      </div>
      <input
        type="file"
        accept="image/*"
        multiple
        disabled={uploading || remaining <= 0}
        onChange={(e) => {
          const files = Array.from(e.target.files ?? []);
          // Reset first so re-picking the same files fires `change` again.
          e.target.value = "";
          if (files.length > 0) void handleFiles(files);
        }}
        className="mt-1 text-xs"
      />
      <p className="text-[11px] text-slate-400 mt-1">
        Select several files at once — they upload together and keep the order you picked.
      </p>
      {progress && (
        <p className="text-xs text-slate-500 mt-1">
          Uploading {progress.done}/{progress.total}…
        </p>
      )}
      {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
    </div>
  );
}
