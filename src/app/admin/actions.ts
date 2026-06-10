"use server";

import { mkdir, writeFile, access } from "node:fs/promises";
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

function getFileExtension(file: File): string {
  const extension = path.extname(file.name).toLowerCase();

  if (extension) {
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
    case "image/svg+xml":
      return ".svg";
    default:
      return ".png";
  }
}

async function saveProjectThumbnail(
  projectId: string,
  file: File,
): Promise<string> {
  const extension = getFileExtension(file);
  const folderPath = path.join(
    process.cwd(),
    "public",
    "assets",
    "images",
    projectId,
  );
  const fileName = `thumbnail${extension}`;

  await mkdir(folderPath, { recursive: true });

  const fullPath = path.join(folderPath, fileName);
  const buffer = Buffer.from(await file.arrayBuffer());

  await writeFile(fullPath, buffer);

  try {
    await access(fullPath);
  } catch (err) {
    console.error(
      "saveProjectThumbnail: file not found after write",
      fullPath,
      err,
    );
    throw err;
  }

  return `/assets/images/${projectId}/${fileName}`;
}

async function saveGalleryImages(
  projectId: string,
  files: File[],
): Promise<string[]> {
  if (files.length === 0) return [];

  const folderPath = path.join(
    process.cwd(),
    "public",
    "assets",
    "images",
    projectId,
  );
  await mkdir(folderPath, { recursive: true });

  const saved: string[] = [];

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const ext = path.extname(file.name) || getFileExtension(file);
    const name = `${Date.now()}-${i}${ext}`;
    const full = path.join(folderPath, name);

    console.log("saveGalleryImages: writing", full);

    const buf = Buffer.from(await file.arrayBuffer());
    await writeFile(full, buf);

    try {
      await access(full);
      console.log("saveGalleryImages: wrote file", full);
    } catch (err) {
      console.error("saveGalleryImages: file not found after write", full, err);
      throw err;
    }

    saved.push(`/assets/images/${projectId}/${name}`);
  }

  return saved;
}

function parseProject(formData: FormData, originalId = ""): Project {
  const id = getField(formData, "id") || originalId;

  if (!id) {
    throw new Error("missing-id");
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
  return returnTo || fallback;
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

  // Log attempt to save files for debugging
  console.log("saveProjectAction: saving files for project", project.id);

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

  const currentProjects = await readProjects();
  const nextProjects = currentProjects.filter(
    (existingProject) => existingProject.id !== originalId,
  );

  nextProjects.push(project);

  await writeProjects(nextProjects);
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

  const remainingProjects = (await readProjects()).filter(
    (project) => project.id !== projectId,
  );

  await writeProjects(remainingProjects);
  redirect("/admin?deleted=1");
}
