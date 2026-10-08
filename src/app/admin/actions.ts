"use server";

import path from "node:path";
import { redirect } from "next/navigation";

import type { Project, ProjectVersion } from "@/lib/project-types";
import {
  clearAdminSession,
  requireAdminSession,
  setAdminSession,
  verifyAdminPassword,
} from "@/lib/admin-auth";
import { readProjects, writeProjects } from "@/lib/project-data";
import { deleteProjectImages, saveProjectImage } from "@/lib/storage";

function getField(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function getFile(formData: FormData, key: string): File | null {
  const value = formData.get(key);

  if (!(value instanceof File) || value.size === 0) {
    return null;
  }

  return value;
}

function getFiles(formData: FormData, key: string): File[] {
  const values = formData.getAll(key);

  return values.filter((v): v is File => v instanceof File && v.size > 0);
}

function splitLines(value: string): string[] {
  return value
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
}

function parseVersions(value: string): ProjectVersion[] | undefined {
  if (!value) {
    return undefined;
  }

  let parsed: unknown;

  try {
    parsed = JSON.parse(value);
  } catch {
    throw new Error("invalid-versions");
  }

  if (!Array.isArray(parsed)) {
    throw new Error("invalid-versions");
  }

  const versions = parsed.map((version) => {
    if (!version || typeof version !== "object") {
      throw new Error("invalid-versions");
    }

    const candidate = version as Partial<ProjectVersion>;

    if (
      typeof candidate.id !== "string" ||
      typeof candidate.title !== "string" ||
      typeof candidate.description !== "string" ||
      typeof candidate.date !== "string" ||
      !Array.isArray(candidate.features)
    ) {
      throw new Error("invalid-versions");
    }

    return {
      id: candidate.id.trim(),
      title: candidate.title.trim(),
      description: candidate.description.trim(),
      date: candidate.date.trim(),
      features: candidate.features.filter(
        (feature): feature is string => typeof feature === "string",
      ),
    };
  });

  return versions.length > 0 ? versions : undefined;
}

function parseNumber(value: string, fallback = 0): number {
  if (!value) {
    return fallback;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

const PROJECT_ID_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

// SVG is excluded on purpose: it can carry scripts and is served from /public.
const ALLOWED_IMAGE_EXTENSIONS = new Set([
  ".png",
  ".jpg",
  ".jpeg",
  ".webp",
  ".gif",
  ".avif",
]);

function getFileExtension(file: File): string {
  const extension = path.extname(file.name).toLowerCase();

  if (extension) {
    if (!ALLOWED_IMAGE_EXTENSIONS.has(extension)) {
      throw new Error("invalid-file-type");
    }

    return extension;
  }

  switch (file.type) {
    case "image/png":
      return ".png";
    case "image/jpeg":
      return ".jpg";
    case "image/webp":
      return ".webp";
    case "image/gif":
      return ".gif";
    case "image/avif":
      return ".avif";
    default:
      throw new Error("invalid-file-type");
  }
}

async function saveProjectThumbnail(
  projectId: string,
  file: File,
): Promise<string> {
  const extension = getFileExtension(file);
  const buffer = Buffer.from(await file.arrayBuffer());

  return saveProjectImage(
    projectId,
    `thumbnail${extension}`,
    buffer,
    file.type || "application/octet-stream",
    "thumbnail",
  );
}

async function saveGalleryImages(
  projectId: string,
  files: File[],
): Promise<string[]> {
  const saved: string[] = [];

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const ext = getFileExtension(file);
    const buffer = Buffer.from(await file.arrayBuffer());

    saved.push(
      await saveProjectImage(
        projectId,
        `${Date.now()}-${i}${ext}`,
        buffer,
        file.type || "application/octet-stream",
      ),
    );
  }

  return saved;
}

function parseProject(formData: FormData, originalId = ""): Project {
  const id = getField(formData, "id") || originalId;

  if (!id) {
    throw new Error("missing-id");
  }

  // The id is used as a folder name on disk, so it must be a safe slug.
  if (!PROJECT_ID_PATTERN.test(id)) {
    throw new Error("invalid-id");
  }

  const title = getField(formData, "title");
  const description = getField(formData, "description");
  const category = getField(formData, "category");
  const date = getField(formData, "date");
  const thumbnail = getField(formData, "thumbnail");
  const link = getField(formData, "link") || "Private";
  const repository = getField(formData, "repository");
  const technologies = splitLines(getField(formData, "technologies"));
  const features = splitLines(getField(formData, "features"));
  const versions = parseVersions(getField(formData, "versions"));

  if (!title || !description || !category || !date) {
    throw new Error("missing-fields");
  }

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    throw new Error("invalid-date");
  }

  return {
    id,
    title,
    description,
    technologies,
    link,
    category,
    date: parsedDate.toISOString(),
    thumbnail,
    difficulty: parseNumber(getField(formData, "difficulty")),
    proudness: parseNumber(getField(formData, "proudness")),
    features,
    repository: repository || undefined,
    versions,
  };
}

function getReturnTarget(formData: FormData, fallback: string): string {
  const returnTo = getField(formData, "returnTo");
  // Only allow same-site admin paths to prevent open redirects.
  return returnTo.startsWith("/admin/") && !returnTo.startsWith("//")
    ? returnTo
    : fallback;
}

export async function loginAction(formData: FormData): Promise<never> {
  const password = getField(formData, "password");

  if (!(await verifyAdminPassword(password))) {
    redirect("/admin/login?error=invalid");
  }

  await setAdminSession();
  redirect("/admin");
}

export async function logoutAction(): Promise<never> {
  await clearAdminSession();
  redirect("/admin/login");
}

export async function saveProjectAction(formData: FormData): Promise<never> {
  const isAuthenticated = await requireAdminSession();

  if (!isAuthenticated) {
    redirect("/admin/login");
  }

  const originalId = getField(formData, "originalId");
  const returnTarget = getReturnTarget(
    formData,
    originalId ? `/admin/projects/${originalId}` : "/admin/projects/new",
  );

  let project: Project;

  try {
    project = parseProject(formData, originalId);
  } catch (error) {
    const message = error instanceof Error ? error.message : "invalid-form";
    redirect(`${returnTarget}?error=${message}`);
  }

  const thumbnailFile = getFile(formData, "thumbnailFile");

  if (thumbnailFile) {
    try {
      project.thumbnail = await saveProjectThumbnail(project.id, thumbnailFile);
    } catch (err) {
      console.error("saveProjectThumbnail failed:", err);
      redirect(`${returnTarget}?error=save-thumbnail`);
    }
  }

  const galleryFiles = getFiles(formData, "images");

  if (galleryFiles.length > 0) {
    try {
      const saved = await saveGalleryImages(project.id, galleryFiles);
      if (!project.thumbnail && saved.length > 0) {
        project.thumbnail = saved[0];
      }
    } catch (err) {
      console.error("saveGalleryImages failed:", err);
      redirect(`${returnTarget}?error=save-gallery`);
    }
  }

  // Must read as admin: otherwise private projects are filtered out and lost on write.
  const currentProjects = await readProjects(true);

  if (
    currentProjects.some(
      (existingProject) =>
        existingProject.id === project.id && existingProject.id !== originalId,
    )
  ) {
    redirect(`${returnTarget}?error=duplicate-id`);
  }

  const nextProjects = currentProjects.filter(
    (existingProject) => existingProject.id !== originalId,
  );

  nextProjects.push(project);

  try {
    await writeProjects(nextProjects);
  } catch (err) {
    console.error("writeProjects failed:", err);
    redirect(`${returnTarget}?error=storage-write`);
  }

  redirect(`/admin/projects/${project.id}?saved=1`);
}

export async function deleteProjectAction(formData: FormData): Promise<never> {
  const isAuthenticated = await requireAdminSession();

  if (!isAuthenticated) {
    redirect("/admin/login");
  }

  const projectId = getField(formData, "id");

  if (!projectId) {
    redirect("/admin?error=missing-id");
  }

  const remainingProjects = (await readProjects(true)).filter(
    (project) => project.id !== projectId,
  );

  try {
    await writeProjects(remainingProjects);

    // Remove uploaded images too; the slug check keeps this inside the project's folder.
    if (PROJECT_ID_PATTERN.test(projectId)) {
      await deleteProjectImages(projectId);
    }
  } catch (err) {
    console.error("deleteProjectAction failed:", err);
    redirect("/admin?error=storage-write");
  }

  redirect("/admin?deleted=1");
}
