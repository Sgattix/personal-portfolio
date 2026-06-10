"use client";

import { useState } from "react";
import { Plus } from "lucide-react";

import { CollectionEditor } from "@/components/admin/collection-editor";

type FeaturesEditorProps = {
  initial?: string[];
  onChange?: (features: string[]) => void;
};

export function FeaturesEditor({
  initial = [],
  onChange,
}: FeaturesEditorProps) {
  const [draft, setDraft] = useState("");

  const handleAppendItem = (value: string) => {
    const nextFeatures = [...initial, value];
    onChange?.(nextFeatures);
  };

  const handleUpdateItem = (index: number, value: string) => {
    const nextFeatures = [...initial];
    nextFeatures[index] = value;
    onChange?.(nextFeatures);
  };

  const handleRemoveItem = (index: number) => {
    const nextFeatures = initial.filter((_, i) => i !== index);
    onChange?.(nextFeatures);
  };

  return (
    <CollectionEditor<string>
      title="Features"
      description="Add each feature as its own item, like the versions list."
      hiddenName="features"
      initialItems={initial}
      serialize={(items) => items.join("\n")}
      emptyMessage="No features yet. Add one above to start the list."
      renderToolbar={({ appendItem }) => (
        <div className="flex items-center gap-2 rounded-2xl border border-neutral-800 bg-neutral-950/80 px-3 py-2">
          <input
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();

                const nextValue = draft.trim();

                if (!nextValue) {
                  return;
                }

                appendItem(nextValue);
                handleAppendItem(nextValue);
                setDraft("");
              }
            }}
            placeholder="Type a feature and press Enter"
            className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-neutral-600"
          />

          <button
            type="button"
            onClick={() => {
              const nextValue = draft.trim();

              if (!nextValue) {
                return;
              }

              appendItem(nextValue);
              handleAppendItem(nextValue);
              setDraft("");
            }}
            className="inline-flex items-center gap-2 rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm text-neutral-100 transition hover:bg-neutral-800"
          >
            <Plus className="size-4" />
            Add
          </button>
        </div>
      )}
      renderItem={({ item, index, updateItem, removeItem }) => (
        <div className="flex items-center gap-2 rounded-2xl border border-neutral-800 bg-neutral-950/80 px-3 py-2">
          <span className="flex size-7 items-center justify-center rounded-full bg-neutral-800 text-xs text-neutral-200">
            {index + 1}
          </span>

          <input
            value={item}
            onChange={(event) => {
              updateItem(event.target.value);
              handleUpdateItem(index, event.target.value);
            }}
            className="min-w-0 flex-1 rounded-xl border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm outline-none transition focus:border-white"
          />

          <button
            type="button"
            onClick={() => {
              removeItem();
              handleRemoveItem(index);
            }}
            className="rounded-full border border-neutral-700 p-2 text-neutral-400 transition hover:border-neutral-500 hover:text-neutral-100"
            aria-label={`Remove feature ${index + 1}`}
          >
            <span className="sr-only">Remove</span>
            <Plus className="size-4 rotate-45" />
          </button>
        </div>
      )}
    />
  );
}
