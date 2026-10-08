import { access, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";

import { del, list, put } from "@vercel/blob";

// Storage backend for the admin CMS.
// - With BLOB_READ_WRITE_TOKEN set (e.g. on Vercel), data lives in Vercel Blob,
//   because serverless filesystems are read-only and reset on every deploy.
// - Otherwise it falls back to the local filesystem (self-hosted / dev).

const projectsFilePath = path.join(
  process.cwd(),
  "src",
  "app",
  "config",
  "projects.json",
);

const PROJECTS_BLOB_PREFIX = "config/projects";

export function isBlobStorageEnabled(): boolean {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}

function imagesFolder(projectId: string): string {
  return path.join(process.cwd(), "public", "assets", "images", projectId);
}

export async function readProjectsFile(): Promise<string> {
  if (isBlobStorageEnabled()) {
    const { blobs } = await list({ prefix: PROJECTS_BLOB_PREFIX });
    const latest = blobs.sort(
      (left, right) => +right.uploadedAt - +left.uploadedAt,
    )[0];

    if (latest) {
      const response = await fetch(latest.url, { cache: "no-store" });

      if (!response.ok) {
        throw new Error(`Failed to read projects blob: ${response.status}`);
      }

      return response.text();
    }

    // First run on Blob: seed from the bundled file.
  }

  return readFile(projectsFilePath, "utf8");
}

export async function writeProjectsFile(content: string): Promise<void> {
  if (!isBlobStorageEnabled()) {
    await writeFile(projectsFilePath, content, "utf8");
    return;
  }

  // A random suffix makes the URL unguessable (the file includes private
  // projects) and gives every version a fresh URL, so CDN caching can't serve
  // stale data.
  const { blobs: previous } = await list({ prefix: PROJECTS_BLOB_PREFIX });
  await put(`${PROJECTS_BLOB_PREFIX}.json`, content, {
    access: "public",
    addRandomSuffix: true,
    contentType: "application/json",
  });

  if (previous.length > 0) {
    await del(previous.map((blob) => blob.url));
  }
}

export async function saveProjectImage(
  projectId: string,
  fileName: string,
  data: Buffer,
  contentType: string,
  replacePrefix?: string,
): Promise<string> {
  if (isBlobStorageEnabled()) {
    if (replacePrefix) {
      const { blobs } = await list({
        prefix: `images/${projectId}/${replacePrefix}`,
      });

      if (blobs.length > 0) {
        await del(blobs.map((blob) => blob.url));
      }
    }

    const blob = await put(`images/${projectId}/${fileName}`, data, {
      access: "public",
      addRandomSuffix: true,
      contentType,
    });

    return blob.url;
  }

  const folderPath = imagesFolder(projectId);
  await mkdir(folderPath, { recursive: true });

  const fullPath = path.join(folderPath, fileName);
  await writeFile(fullPath, data);
  await access(fullPath);

  return `/assets/images/${projectId}/${fileName}`;
}

export async function deleteProjectImages(projectId: string): Promise<void> {
  if (isBlobStorageEnabled()) {
    const { blobs } = await list({ prefix: `images/${projectId}/` });

    if (blobs.length > 0) {
      await del(blobs.map((blob) => blob.url));
    }

    return;
  }

  await rm(imagesFolder(projectId), { recursive: true, force: true });
}
