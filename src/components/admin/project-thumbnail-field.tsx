"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { Upload } from "lucide-react";

import { Dropzone } from "@/components/kibo-ui/dropzone";
import { cn } from "@/lib/utils";

type ProjectThumbnailFieldProps = {
  projectId: string;
  initialThumbnail: string;
};

export function ProjectThumbnailField({
  projectId,
  initialThumbnail,
}: ProjectThumbnailFieldProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!selectedFile) {
      setPreviewUrl(null);
      return;
    }

    const objectUrl = URL.createObjectURL(selectedFile);
    setPreviewUrl(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [selectedFile]);

  const currentPreview = previewUrl ?? initialThumbnail;
  const helperText = selectedFile
    ? `${selectedFile.name} will be written to public/assets/images/${projectId}/`
    : initialThumbnail
      ? "Drop a new image to replace the current thumbnail or keep editing the path below."
      : "Drop a new image, or type a public asset path below.";

  return (
    <section className="space-y-3">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-neutral-100">Thumbnail</p>
          <p className="text-xs text-neutral-400">
            Drag an image in here to upload it into the project asset folder.
          </p>
        </div>
        <span className="text-xs text-neutral-500">PNG, JPG, WEBP, AVIF</span>
      </div>

      <Dropzone
        accept={{ "image/*": [] }}
        maxFiles={1}
        maxSize={5 * 1024 * 1024}
        src={selectedFile ? [selectedFile] : undefined}
        inputProps={{
          name: "thumbnailFile",
          accept: "image/*",
          form: "project-form",
        }}
        onDrop={(acceptedFiles) => {
          setSelectedFile(acceptedFiles.at(0) ?? null);
        }}
        className={cn(
          "border-neutral-800 bg-neutral-950/90 p-0 text-left shadow-none hover:bg-neutral-900/80",
        )}
      >
        <div className="grid w-full gap-4 p-4 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,0.9fr)]">
          <div className="overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900">
            {currentPreview ? (
              <div className="relative h-56 w-full">
                <Image
                  src={currentPreview}
                  alt="Project thumbnail preview"
                  fill
                  unoptimized
                  className="object-cover"
                />
              </div>
            ) : (
              <div className="flex h-56 items-center justify-center bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.1),transparent_60%)] px-6 text-center">
                <div>
                  <Upload className="mx-auto mb-3 size-5 text-neutral-400" />
                  <p className="text-sm text-neutral-200">
                    Drop a cover image here to preview it before saving.
                  </p>
                  <p className="mt-1 text-xs text-neutral-500">
                    Files stay local until you submit the form.
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-col justify-between gap-4 text-left">
            <div className="space-y-3 rounded-2xl border border-dashed border-neutral-700 bg-neutral-900/70 p-4">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-full border border-neutral-700 bg-neutral-950 text-neutral-200">
                  <Upload className="size-4" />
                </div>
                <div>
                  <p className="text-sm font-medium text-neutral-100">
                    Replace thumbnail
                  </p>
                  <p className="text-xs text-neutral-400">
                    Click or drag and drop to attach one image.
                  </p>
                </div>
              </div>
              <p className="text-xs leading-5 text-neutral-500">{helperText}</p>
            </div>

            <label className="space-y-2">
              <span className="text-sm text-neutral-300">
                Thumbnail path fallback
              </span>
              <input
                name="thumbnail"
                defaultValue={initialThumbnail}
                placeholder="/assets/images/project-id/thumbnail.png"
                className="w-full rounded-2xl border border-neutral-700 bg-neutral-950 px-4 py-3 text-sm outline-none transition focus:border-white"
              />
            </label>
          </div>
        </div>
      </Dropzone>
    </section>
  );
}
