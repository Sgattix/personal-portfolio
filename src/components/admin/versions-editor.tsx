"use client";

import { Plus, Trash2 } from "lucide-react";
import type { ProjectVersion } from "@/lib/project-types";

import { CollectionEditor } from "@/components/admin/collection-editor";
import { DateTimePicker } from "@/components/admin/date-time-picker";
import { FeaturesEditor } from "./features-editor";

type VersionsEditorProps = {
  initial?: ProjectVersion[] | undefined;
};

function createVersion(): ProjectVersion {
  return {
    id: "",
    title: "",
    description: "",
    date: new Date().toISOString(),
    features: [],
  };
}

export function VersionsEditor({ initial }: VersionsEditorProps) {
  return (
    <CollectionEditor<ProjectVersion>
      title="Versions"
      description="Group release notes into structured entries instead of raw JSON."
      hiddenName="versions"
      initialItems={initial ?? []}
      serialize={(items) =>
        items.length > 0 ? JSON.stringify(items, null, 2) : ""
      }
      emptyMessage="No versions yet. Add one to start a release history."
      renderToolbar={({ appendItem }) => (
        <button
          type="button"
          onClick={() => appendItem(createVersion())}
          className="inline-flex items-center gap-2 rounded-md bg-neutral-800 px-3 py-1 text-sm"
        >
          <Plus className="size-4 inline-block" /> Add
        </button>
      )}
      renderItem={({ item, index, updateItem, removeItem }) => (
        <div className="rounded-2xl border border-neutral-800 p-3">
          <div className="flex items-center justify-between gap-4">
            <div className="flex flex-1 gap-2">
              <input
                placeholder="id"
                value={item.id}
                onChange={(event) =>
                  updateItem({ ...item, id: event.target.value })
                }
                className="min-w-0 flex-1 rounded-2xl border border-neutral-700 bg-neutral-950 px-3 py-1 text-sm"
              />
              <input
                placeholder="title"
                value={item.title}
                onChange={(event) =>
                  updateItem({ ...item, title: event.target.value })
                }
                className="min-w-0 flex-1 rounded-2xl border border-neutral-700 bg-neutral-950 px-3 py-1 text-sm"
              />
            </div>

            <button
              type="button"
              onClick={removeItem}
              className="text-red-400"
              aria-label={`Remove version ${index + 1}`}
            >
              <Trash2 className="size-4" />
            </button>
          </div>

          <div className="mt-2 grid gap-2">
            <DateTimePicker
              value={item.date}
              onChange={(nextDate) =>
                updateItem({ ...item, date: nextDate || item.date })
              }
            />
            <textarea
              rows={3}
              value={item.description}
              onChange={(event) =>
                updateItem({ ...item, description: event.target.value })
              }
              className="rounded-2xl border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm"
            />
            <FeaturesEditor
              initial={item.features}
              onChange={(nextFeatures) =>
                updateItem({ ...item, features: nextFeatures })
              }
            />
          </div>
        </div>
      )}
    />
  );
}
