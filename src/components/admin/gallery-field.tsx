"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

import { Dropzone } from "@/components/kibo-ui/dropzone";
import { cn } from "@/lib/utils";

export function GalleryField() {
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);

  useEffect(() => {
    const urls = files.map((f) => URL.createObjectURL(f));
    setPreviews(urls);

    return () => urls.forEach((u) => URL.revokeObjectURL(u));
  }, [files]);

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-neutral-100">Gallery</p>
          <p className="text-xs text-neutral-400">
            Upload additional images for the project gallery.
          </p>
        </div>
        <span className="text-xs text-neutral-500">Max 12 images</span>
      </div>

      <Dropzone
        accept={{ "image/*": [] }}
        maxFiles={12}
        maxSize={8 * 1024 * 1024}
        src={files.length ? files : undefined}
        inputProps={{
          name: "images",
          multiple: true,
          accept: "image/*",
          form: "project-form",
        }}
        onDrop={(acceptedFiles) => {
          setFiles((prev) => [...prev, ...acceptedFiles].slice(0, 12));
        }}
        className={cn("border-neutral-800 bg-neutral-950/90 p-4")}
      >
        <div className="grid gap-3">
          {previews.length > 0 ? (
            <div className="grid grid-cols-3 gap-2">
              {previews.map((src, idx) => (
                <div
                  key={idx}
                  className="relative h-24 w-full overflow-hidden rounded-md"
                >
                  <Image
                    src={src}
                    alt={`preview ${idx + 1}`}
                    fill
                    unoptimized
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center py-8 text-sm text-neutral-400">
              Drag images here or click to add
            </div>
          )}
        </div>
      </Dropzone>
    </section>
  );
}
