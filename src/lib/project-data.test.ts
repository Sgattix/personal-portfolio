import { beforeEach, describe, expect, it, vi } from "vitest";

import type { ContributionItem } from "@/lib/project-data";

const stored = vi.hoisted(() => ({ json: "" }));

vi.mock("@/lib/storage", () => ({
  readProjectsFile: async () => stored.json,
  writeProjectsFile: async (content: string) => {
    stored.json = content;
  },
}));

const { buildContributionWeeks, readProjects, writeProjects } = await import(
  "@/lib/project-data"
);

function item(date: string): ContributionItem {
  return { id: date, title: "", description: "", date, kind: "milestone" };
}

describe("buildContributionWeeks", () => {
  it("runs in a timezone ahead of UTC", () => {
    expect(new Date("2024-06-15T00:00:00Z").getTimezoneOffset()).toBeLessThan(
      0,
    );
  });

  it("puts an item on its calendar day, not the day before", () => {
    const weeks = buildContributionWeeks(
      [item("2024-06-15T00:00:00.000Z")],
      new Map(),
      new Date("2024-06-30T12:00:00Z"),
    );

    const filled = weeks.flatMap((week) => week.cells).filter((c) => c.count);

    expect(filled).toHaveLength(1);
    expect(new Date(filled[0].date).getDate()).toBe(15);
  });

  it("counts several items on the same day", () => {
    const weeks = buildContributionWeeks(
      [item("2024-03-01T00:00:00.000Z"), item("2024-03-01T10:00:00.000Z")],
      new Map(),
      new Date("2024-03-10T12:00:00Z"),
    );

    const filled = weeks.flatMap((week) => week.cells).filter((c) => c.count);

    expect(filled).toHaveLength(1);
    expect(filled[0].count).toBe(2);
  });

  it("produces full 7-day weeks", () => {
    const weeks = buildContributionWeeks(
      [item("2024-01-01T00:00:00.000Z")],
      new Map(),
      new Date("2024-02-01T12:00:00Z"),
    );

    expect(weeks.every((week) => week.cells.length === 7)).toBe(true);
  });

  it("merges GitHub counts without letting them flatten project days", () => {
    const weeks = buildContributionWeeks(
      [item("2024-03-05T00:00:00.000Z")],
      new Map([
        ["2024-03-01", 1],
        ["2024-03-02", 2],
        ["2024-03-03", 20],
        ["2024-03-05", 3],
      ]),
      new Date("2024-03-10T12:00:00Z"),
    );

    const byDay = new Map(
      weeks
        .flatMap((week) => week.cells)
        .map((cell) => [new Date(cell.date).getDate(), cell]),
    );

    expect(byDay.get(5)?.count).toBe(4);
    expect(byDay.get(5)?.githubCount).toBe(3);
    expect(byDay.get(1)?.level).toBe(1);
    expect(byDay.get(3)?.level).toBe(4);
    expect(byDay.get(5)?.level).toBeLessThan(4);
  });
});

describe("readProjects", () => {
  beforeEach(() => {
    stored.json = JSON.stringify({
      projects: [
        { id: "pub", link: "https://x.dev", date: "2024-01-01T00:00:00Z" },
        { id: "priv", link: "Private", date: "2024-02-01T00:00:00Z" },
        { title: "no id" },
      ],
    });
  });

  it("hides private projects from visitors", async () => {
    expect((await readProjects()).map((p) => p.id)).toEqual(["pub"]);
  });

  it("shows private projects to the admin, newest first", async () => {
    expect((await readProjects(true)).map((p) => p.id)).toEqual([
      "priv",
      "pub",
    ]);
  });

  it("round-trips through writeProjects without losing data", async () => {
    const before = await readProjects(true);
    await writeProjects(before);

    expect(await readProjects(true)).toEqual(before);
  });
});
