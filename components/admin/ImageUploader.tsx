"use client";

import { useState } from "react";
import { AdminApi } from "@/lib/api";
import { AdminThumb } from "@/components/admin/AdminThumb";
import { uploadImage, describeRejection } from "@/lib/uploadImage";

interface Props {
  api: AdminApi;
  value: string;
  onChange: (url: string) => void;
  label?: string;
}

export function ImageUploader({ api, value, onChange, label = "Image" }: Props) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFile = async (file: File) => {
    const rejection = describeRejection(file);
    if (rejection) {
      setError(rejection);
      return;
    }
    setError(null);
    setUploading(true);
    try {
      onChange(await uploadImage(api, file));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <label className="block text-xs font-medium text-slate-600 mb-1">{label}</label>
      <div className="flex items-center gap-3">
        {value ? (
          <AdminThumb
            src={value}
            size={64}
            alt="preview"
            className="w-16 h-16 object-cover rounded border border-slate-200"
          />
        ) : (
          <div className="w-16 h-16 rounded border border-dashed border-slate-300 bg-slate-50" />
        )}
        <div className="flex-1">
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Image URL or upload below"
            className="w-full px-3 py-2 border border-slate-300 rounded text-sm focus:outline-none focus:border-forest"
          />
          <input
            type="file"
            accept="image/*"
            disabled={uploading}
            onChange={(e) => {
              const f = e.target.files?.[0];
              // Reset first so re-picking the same file fires `change` again.
              e.target.value = "";
              if (f) void handleFile(f);
            }}
            className="mt-1 text-xs"
          />
        </div>
      </div>
      {uploading && <p className="text-xs text-slate-500 mt-1">Uploading…</p>}
      {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
    </div>
  );
}
