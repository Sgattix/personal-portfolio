"use client";

import { useState, type ReactNode } from "react";

type CollectionEditorProps<T> = {
  title: string;
  description: string;
  hiddenName: string;
  initialItems: T[];
  serialize: (items: T[]) => string;
  emptyMessage: string;
  renderItem: (args: {
    item: T;
    index: number;
    updateItem: (nextItem: T) => void;
    removeItem: () => void;
  }) => ReactNode;
  renderToolbar?: (args: {
    items: T[];
    appendItem: (item: T) => void;
  }) => ReactNode;
  getKey?: (item: T, index: number) => string;
};

export function CollectionEditor<T>({
  title,
  description,
  hiddenName,
  initialItems,
  serialize,
  emptyMessage,
  renderItem,
  renderToolbar,
  getKey,
}: CollectionEditorProps<T>) {
  const [items, setItems] = useState<T[]>(initialItems);

  function appendItem(item: T) {
    setItems((current) => [...current, item]);
  }

  function updateItem(index: number, nextItem: T) {
    setItems((current) =>
      current.map((item, itemIndex) => (itemIndex === index ? nextItem : item)),
    );
  }

  function removeItem(index: number) {
    setItems((current) =>
      current.filter((_, itemIndex) => itemIndex !== index),
    );
  }

  return (
    <section className="space-y-3">
      <div>
        <p className="text-sm font-medium text-neutral-100">{title}</p>
        <p className="text-xs text-neutral-400">{description}</p>
      </div>

      <div className="space-y-2">
        {items.length > 0 ? (
          items.map((item, index) => (
            <div key={getKey?.(item, index) ?? index.toString()}>
              {renderItem({
                item,
                index,
                updateItem: (nextItem) => updateItem(index, nextItem),
                removeItem: () => removeItem(index),
              })}
            </div>
          ))
        ) : (
          <div className="rounded-2xl border border-dashed border-neutral-800 bg-neutral-950/60 px-4 py-6 text-sm text-neutral-500">
            {emptyMessage}
          </div>
        )}
      </div>

      {renderToolbar ? renderToolbar({ items, appendItem }) : null}

      <input
        type="hidden"
        name={hiddenName}
        value={serialize(items)}
        readOnly
      />
    </section>
  );
}
