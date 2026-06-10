"use client";

import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";

type TagsFieldProps = {
  initialTags?: string[];
};

export function TagsField({ initialTags = [] }: TagsFieldProps) {
  const [tags, setTags] = useState<string[]>(initialTags);
  const [input, setInput] = useState("");
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    // keep hidden input updated via DOM when tags change
    const el = document.querySelector<HTMLInputElement>(
      "input[name=technologies]",
    );
    if (el) el.value = tags.join("\n");
  }, [tags]);

  function addTag(value: string) {
    const v = value.trim();
    if (!v) return;
    if (tags.includes(v)) return;
    setTags((t) => [...t, v]);
    setInput("");
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-2 rounded-full bg-neutral-800 px-3 py-1 text-sm"
          >
            <span>{tag}</span>
            <button
              type="button"
              onClick={() => setTags((t) => t.filter((x) => x !== tag))}
              className="opacity-70"
            >
              <X className="size-3" />
            </button>
          </span>
        ))}
        <input
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === ",") {
              e.preventDefault();
              addTag(input);
            }
            if (e.key === "Backspace" && !input) {
              setTags((t) => t.slice(0, -1));
            }
          }}
          placeholder="Add technology and press Enter"
          className="rounded-2xl border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm outline-none"
        />
      </div>
      <input type="hidden" name="technologies" />
    </div>
  );
}
