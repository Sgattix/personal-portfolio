import { beforeEach, describe, expect, it, vi } from "vitest";

import type { Project } from "@/lib/project-types";

// next/navigation's redirect() throws to stop execution; mimic that so tests
// can assert on the target URL.
class RedirectError extends Error {
  constructor(public url: string) {
    super(`redirect:${url}`);
  }
}

const state = vi.hoisted(() => ({
  authenticated: true,
  projectsJson: "",
  images: new Map<string, Buffer>(),
  failWrites: false,
}));

vi.mock("next/navigation", () => ({
  redirect: (url: string) => {
    throw new RedirectError(url);
  },
}));

vi.mock("@/lib/admin-auth", () => ({
  requireAdminSession: async () => state.authenticated,
  verifyAdminPassword: async (password: string) => password === "testpw",
  setAdminSession: async () => {},
  clearAdminSession: async () => {},
}));

vi.mock("@/lib/storage", () => ({
  readProjectsFile: async () => state.projectsJson,
  writeProjectsFile: async (content: string) => {
    if (state.failWrites) throw new Error("EROFS");
    state.projectsJson = content;
  },
  saveProjectImage: async (projectId: string, fileName: string, data: Buffer) => {
    state.images.set(`${projectId}/${fileName}`, data);
    return `/assets/images/${projectId}/${fileName}`;
  },
  deleteProjectImages: async (projectId: string) => {
    for (const key of [...state.images.keys()]) {
      if (key.startsWith(`${projectId}/`)) state.images.delete(key);
    }
  },
}));

const { deleteProjectAction, loginAction, saveProjectAction } = await import(
  "@/app/admin/actions"
);

function project(id: string, link = "https://example.com"): Project {
  return {
    id,
    title: id,
    description: "desc",
    technologies: [],
    link,
    category: "web",
    date: "2024-01-01T00:00:00.000Z",
    thumbnail: "",
    difficulty: 0,
    proudness: 0,
    features: [],
  };
}

function storedProjects(): Project[] {
  return JSON.parse(state.projectsJson).projects;
}

function form(fields: Record<string, string | File>): FormData {
  const data = new FormData();
  for (const [key, value] of Object.entries(fields)) data.append(key, value);
  return data;
}

function validFields(id: string): Record<string, string> {
  return {
    id,
    title: "Title",
    description: "Description",
    category: "web",
    date: "2024-01-01",
  };
}

async function redirectOf(action: Promise<unknown>): Promise<string> {
  try {
    await action;
  } catch (error) {
    if (error instanceof RedirectError) return error.url;
    throw error;
  }
  throw new Error("expected a redirect");
}

beforeEach(() => {
  state.authenticated = true;
  state.failWrites = false;
  state.images.clear();
  state.projectsJson = JSON.stringify({
    projects: [
      project("public-one"),
      project("secret-one", "Private"),
      project("secret-two", "Private"),
    ],
  });
});

describe("saveProjectAction", () => {
  it("keeps private projects when saving another project", async () => {
    const url = await redirectOf(saveProjectAction(form(validFields("new-one"))));

    expect(url).toBe("/admin/projects/new-one?saved=1");
    expect(storedProjects().map((p) => p.id).sort()).toEqual([
      "new-one",
      "public-one",
      "secret-one",
      "secret-two",
    ]);
  });

  it("updates in place when editing, including renaming the id", async () => {
    await redirectOf(
      saveProjectAction(
        form({ ...validFields("renamed"), originalId: "secret-one" }),
      ),
    );

    const ids = storedProjects().map((p) => p.id);
    expect(ids).toContain("renamed");
    expect(ids).not.toContain("secret-one");
    expect(ids).toHaveLength(3);
  });

  it("rejects an id already used by another project", async () => {
    const url = await redirectOf(
      saveProjectAction(form(validFields("secret-two"))),
    );

    expect(url).toBe("/admin/projects/new?error=duplicate-id");
    expect(storedProjects()).toHaveLength(3);
  });

  it.each(["../../evil", "UPPER", "with space", "a--b", "-lead", "a/b"])(
    "rejects unsafe id %j",
    async (id) => {
      const url = await redirectOf(saveProjectAction(form(validFields(id))));

      expect(url).toBe("/admin/projects/new?error=invalid-id");
    },
  );

  it("rejects missing required fields", async () => {
    const url = await redirectOf(
      saveProjectAction(form({ id: "x", title: "only title" })),
    );

    expect(url).toBe("/admin/projects/new?error=missing-fields");
  });

  it("rejects invalid dates", async () => {
    const url = await redirectOf(
      saveProjectAction(form({ ...validFields("x"), date: "not-a-date" })),
    );

    expect(url).toBe("/admin/projects/new?error=invalid-date");
  });

  it("ignores external returnTo targets (open redirect)", async () => {
    const url = await redirectOf(
      saveProjectAction(
        form({ ...validFields("../x"), returnTo: "https://evil.com" }),
      ),
    );

    expect(url).toBe("/admin/projects/new?error=invalid-id");
  });

  it("rejects protocol-relative returnTo targets", async () => {
    const url = await redirectOf(
      saveProjectAction(
        form({ ...validFields("../x"), returnTo: "//evil.com/admin/" }),
      ),
    );

    expect(url).toBe("/admin/projects/new?error=invalid-id");
  });

  it("stores an uploaded png thumbnail", async () => {
    const thumbnailFile = new File([new Uint8Array([0x89, 0x50])], "a.png", {
      type: "image/png",
    });

    await redirectOf(
      saveProjectAction(form({ ...validFields("pic"), thumbnailFile })),
    );

    expect(state.images.has("pic/thumbnail.png")).toBe(true);
    expect(storedProjects().find((p) => p.id === "pic")?.thumbnail).toBe(
      "/assets/images/pic/thumbnail.png",
    );
  });

  it.each([
    ["x.svg", "image/svg+xml"],
    ["x.html", "text/html"],
    ["noext", "text/html"],
  ])("rejects unsafe upload %s", async (name, type) => {
    const thumbnailFile = new File(["<script>alert(1)</script>"], name, {
      type,
    });

    const url = await redirectOf(
      saveProjectAction(form({ ...validFields("pic"), thumbnailFile })),
    );

    expect(url).toBe("/admin/projects/new?error=save-thumbnail");
    expect(state.images.size).toBe(0);
  });

  it("uses the first gallery image as thumbnail when none is set", async () => {
    const image = new File([new Uint8Array([1])], "g.webp", {
      type: "image/webp",
    });

    await redirectOf(
      saveProjectAction(form({ ...validFields("gal"), images: image })),
    );

    expect(storedProjects().find((p) => p.id === "gal")?.thumbnail).toMatch(
      /^\/assets\/images\/gal\/\d+-0\.webp$/,
    );
  });

  it("reports storage write failures instead of crashing", async () => {
    state.failWrites = true;

    const url = await redirectOf(saveProjectAction(form(validFields("x"))));

    expect(url).toBe("/admin/projects/new?error=storage-write");
  });

  it("requires a session", async () => {
    state.authenticated = false;

    const url = await redirectOf(saveProjectAction(form(validFields("x"))));

    expect(url).toBe("/admin/login");
    expect(storedProjects()).toHaveLength(3);
  });
});

describe("deleteProjectAction", () => {
  it("deletes only the target and keeps private projects", async () => {
    const url = await redirectOf(
      deleteProjectAction(form({ id: "public-one" })),
    );

    expect(url).toBe("/admin?deleted=1");
    expect(storedProjects().map((p) => p.id).sort()).toEqual([
      "secret-one",
      "secret-two",
    ]);
  });

  it("removes the project's images", async () => {
    state.images.set("public-one/thumbnail.png", Buffer.from("x"));
    state.images.set("other/thumbnail.png", Buffer.from("x"));

    await redirectOf(deleteProjectAction(form({ id: "public-one" })));

    expect([...state.images.keys()]).toEqual(["other/thumbnail.png"]);
  });

  it("requires a session", async () => {
    state.authenticated = false;

    const url = await redirectOf(
      deleteProjectAction(form({ id: "public-one" })),
    );

    expect(url).toBe("/admin/login");
    expect(storedProjects()).toHaveLength(3);
  });

  it("rejects a missing id", async () => {
    const url = await redirectOf(deleteProjectAction(form({})));

    expect(url).toBe("/admin?error=missing-id");
  });
});

describe("loginAction", () => {
  it("rejects a wrong password", async () => {
    const url = await redirectOf(loginAction(form({ password: "nope" })));

    expect(url).toBe("/admin/login?error=invalid");
  });

  it("logs in with the right password", async () => {
    const url = await redirectOf(loginAction(form({ password: "testpw" })));

    expect(url).toBe("/admin");
  });
});
