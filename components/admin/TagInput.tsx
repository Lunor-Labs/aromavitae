"use client";

import { useState } from "react";

interface Props {
  values: string[];
  onChange: (tags: string[]) => void;
  label?: string;
}

/** Chip-style multi-value text input — type a tag and press Enter or comma to add it. */
export function TagInput({ values, onChange, label = "Tags" }: Props) {
  const [draft, setDraft] = useState("");

  const addTag = () => {
    const tag = draft.trim();
    if (!tag || values.some((v) => v.toLowerCase() === tag.toLowerCase())) {
      setDraft("");
      return;
    }
    onChange([...values, tag]);
    setDraft("");
  };

  const removeTag = (tag: string) => onChange(values.filter((v) => v !== tag));

  return (
    <div>
      <label className="block text-xs font-medium text-slate-600 mb-1">{label}</label>
      {values.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2">
          {values.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1.5 bg-forest/10 text-forest text-xs px-2.5 py-1 rounded-full"
            >
              {tag}
              <button
                type="button"
                onClick={() => removeTag(tag)}
                aria-label={`Remove ${tag}`}
                className="text-forest/70 hover:text-forest"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === ",") {
              e.preventDefault();
              addTag();
            }
          }}
          placeholder="Type a tag and press Enter"
          className="flex-1 px-3 py-2 border border-slate-300 rounded text-sm focus:outline-none focus:border-forest"
        />
        <button
          type="button"
          onClick={addTag}
          disabled={!draft.trim()}
          className="px-3 py-2 text-sm border border-slate-300 rounded disabled:opacity-40"
        >
          Add
        </button>
      </div>
    </div>
  );
}
