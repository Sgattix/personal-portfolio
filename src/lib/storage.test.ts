import { mkdtemp, mkdir, readFile, rm, stat, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

type FakeBlob = { url: string; pathname: string; data: string; uploadedAt: Date };

const blobStore = vi.hoisted(() => ({
  blobs: [] as FakeBlob[],
  counter: 0,
}));

vi.mock("@vercel/blob", () => ({
  list: async ({ prefix }: { prefix: string }) => ({
    blobs: blobStore.blobs.filter((blob) => blob.pathname.startsWith(prefix)),
  }),
  put: async (
    pathname: string,
    data: string | Buffer,
    options: { addRandomSuffix?: boolean },
  ) => {
    blobStore.counter += 1;
    const finalPath = options.addRandomSuffix
      ? pathname.replace(/(\.[^.]+)$/, `-r${blobStore.counter}$1`)
      : pathname;
    const blob = {
      url: `https://store.public.blob.vercel-storage.com/${finalPath}`,
      pathname: finalPath,
      data: data.toString(),
      uploadedAt: new Date(Date.UTC(2024, 0, 1, 0, 0, blobStore.counter)),
    };
    blobStore.blobs.push(blob);
    return blob;
  },
  del: async (urls: string[]) => {
    blobStore.blobs = blobStore.blobs.filter((blob) => !urls.includes(blob.url));
  },
}));

let workDir: string;

async function loadStorage() {
  vi.resetModules();
  return import("@/lib/storage");
}

beforeEach(async () => {
  workDir = await mkdtemp(path.join(os.tmpdir(), "portfolio-storage-"));
  await mkdir(path.join(workDir, "src", "app", "config"), { recursive: true });
  await writeFile(
    path.join(workDir, "src", "app", "config", "projects.json"),
    '{"projects":["bundled"]}',
  );
  vi.spyOn(process, "cwd").mockReturnValue(workDir);
  blobStore.blobs = [];
  blobStore.counter = 0;
});

afterEach(async () => {
  vi.restoreAllMocks();
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
  await rm(workDir, { recursive: true, force: true });
});

describe("filesystem backend", () => {
  beforeEach(() => {
    vi.stubEnv("BLOB_READ_WRITE_TOKEN", "");
  });

  it("reads and writes projects.json on disk", async () => {
    const storage = await loadStorage();

    expect(await storage.readProjectsFile()).toBe('{"projects":["bundled"]}');

    await storage.writeProjectsFile('{"projects":["changed"]}');

    expect(
      await readFile(
        path.join(workDir, "src", "app", "config", "projects.json"),
        "utf8",
      ),
    ).toBe('{"projects":["changed"]}');
  });

  it("saves images under public and deletes the project folder", async () => {
    const storage = await loadStorage();

    const url = await storage.saveProjectImage(
      "demo",
      "thumbnail.png",
      Buffer.from("png"),
      "image/png",
    );

    expect(url).toBe("/assets/images/demo/thumbnail.png");
    const folder = path.join(workDir, "public", "assets", "images", "demo");
    expect((await stat(path.join(folder, "thumbnail.png"))).isFile()).toBe(
      true,
    );

    await storage.deleteProjectImages("demo");

    await expect(stat(folder)).rejects.toThrow();
  });
});

describe("Vercel Blob backend", () => {
  beforeEach(() => {
    vi.stubEnv("BLOB_READ_WRITE_TOKEN", "vercel_blob_rw_test_secret");
    vi.stubGlobal(
      "fetch",
      vi.fn(async (url: string) => {
        const blob = blobStore.blobs.find((candidate) => candidate.url === url);
        return new Response(blob?.data ?? "", { status: blob ? 200 : 404 });
      }),
    );
  });

  it("seeds from the bundled file before anything is written", async () => {
    const storage = await loadStorage();

    expect(await storage.readProjectsFile()).toBe('{"projects":["bundled"]}');
  });

  it("writes to Blob, never to disk, and reads back the latest version", async () => {
    const storage = await loadStorage();

    await storage.writeProjectsFile('{"projects":["v1"]}');
    await storage.writeProjectsFile('{"projects":["v2"]}');

    expect(await storage.readProjectsFile()).toBe('{"projects":["v2"]}');
    expect(
      blobStore.blobs.filter((blob) => blob.pathname.startsWith("config/")),
    ).toHaveLength(1);
    expect(
      await readFile(
        path.join(workDir, "src", "app", "config", "projects.json"),
        "utf8",
      ),
    ).toBe('{"projects":["bundled"]}');
  });

  it("stores projects.json at an unguessable path", async () => {
    const storage = await loadStorage();

    await storage.writeProjectsFile("{}");

    expect(blobStore.blobs[0].pathname).not.toBe("config/projects.json");
  });

  it("replaces the old thumbnail and deletes all project images", async () => {
    const storage = await loadStorage();

    await storage.saveProjectImage("demo", "thumbnail.png", Buffer.from("a"), "image/png", "thumbnail");
    const url = await storage.saveProjectImage("demo", "thumbnail.jpg", Buffer.from("b"), "image/jpeg", "thumbnail");
    await storage.saveProjectImage("demo", "1-0.png", Buffer.from("c"), "image/png");
    await storage.saveProjectImage("other", "thumbnail.png", Buffer.from("d"), "image/png");

    expect(url).toMatch(/^https:\/\/.*\/images\/demo\/thumbnail-r\d+\.jpg$/);
    expect(
      blobStore.blobs.filter((blob) => blob.pathname.startsWith("images/demo/thumbnail")),
    ).toHaveLength(1);

    await storage.deleteProjectImages("demo");

    expect(blobStore.blobs.map((blob) => blob.pathname)).toEqual([
      expect.stringMatching(/^images\/other\//),
    ]);
  });
});
