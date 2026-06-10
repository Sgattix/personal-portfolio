import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import type { Project, ProjectVersion } from "@/lib/project-types";

export type ContributionKind = "project" | "release" | "milestone";

export type ContributionItem = {
  id: string;
  title: string;
  description: string;
  date: string;
  kind: ContributionKind;
  href?: string;
  label?: string;
};

export type ContributionCell = {
  date: string;
  count: number;
  level: 0 | 1 | 2 | 3 | 4;
  items: ContributionItem[];
};

export type ContributionWeek = {
  label?: string;
  cells: ContributionCell[];
};

export type ContributionStats = {
  totalItems: number;
  activeDays: number;
  totalCount: number;
  firstDate?: string;
  lastDate?: string;
};

const projectsFilePath = path.join(
  process.cwd(),
  "src",
  "app",
  "config",
  "projects.json",
);

type ProjectsFile = {
  projects: Project[];
};

const milestoneItems: ContributionItem[] = [
  {
    id: "milestone-omnicraft-2020",
    title: "OmniCraft Network launched",
    description:
      "Founded the first major server project and started building custom game modes and tooling.",
    date: "2020-01-01T00:00:00.000Z",
    kind: "milestone",
    label: "Founding",
  },
  {
    id: "milestone-omnisys-2021",
    title: "Started Omnisys",
    description:
      "Wrote the first version of the Discord bot that later grew into a modular utility project.",
    date: "2021-08-14T09:08:14.000Z",
    kind: "milestone",
    label: "First code",
  },
  {
    id: "milestone-development-academy-2023",
    title: "Development Academy founded",
    description:
      "Started a no-profit training initiative focused on mentoring and practical software education.",
    date: "2023-06-01T00:00:00.000Z",
    kind: "milestone",
    label: "Education",
  },
  {
    id: "milestone-obsmc-2023",
    title: "Joined ObsMC Network",
    description:
      "Contributed to server-side plugin development and code review work for a Minecraft network.",
    date: "2023-09-01T00:00:00.000Z",
    kind: "milestone",
    label: "Team work",
  },
  {
    id: "milestone-titanet-2024",
    title: "Started Titanet Network work",
    description:
      "Continued building Java plugins and web tooling for a server that stayed ahead of the curve.",
    date: "2024-01-01T00:00:00.000Z",
    kind: "milestone",
    label: "Current role",
  },
];

function toStringArray(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : [];
}

function toVersions(value: unknown): ProjectVersion[] | undefined {
  if (!Array.isArray(value)) {
    return undefined;
  }

  const versions = value
    .map((version) => {
      if (!version || typeof version !== "object") {
        return null;
      }

      const candidate = version as Partial<ProjectVersion>;

      if (
        typeof candidate.id !== "string" ||
        typeof candidate.title !== "string" ||
        typeof candidate.description !== "string" ||
        typeof candidate.date !== "string"
      ) {
        return null;
      }

      return {
        id: candidate.id,
        title: candidate.title,
        description: candidate.description,
        date: candidate.date,
        features: toStringArray(candidate.features),
      };
    })
    .filter((version): version is ProjectVersion => version !== null);

  return versions.length > 0 ? versions : undefined;
}

function normalizeProject(project: Partial<Project> & { id: string }): Project {
  return {
    id: project.id,
    title: project.title ?? "Untitled project",
    description: project.description ?? "",
    technologies: toStringArray(project.technologies),
    link: project.link ?? "Private",
    category: project.category ?? "uncategorized",
    date: project.date ?? new Date().toISOString(),
    thumbnail: project.thumbnail ?? "",
    difficulty: typeof project.difficulty === "number" ? project.difficulty : 0,
    proudness: typeof project.proudness === "number" ? project.proudness : 0,
    features: toStringArray(project.features),
    repository: project.repository,
    versions: toVersions(project.versions),
  };
}

export function sortProjects(projects: Project[]): Project[] {
  return [...projects].sort(
    (firstProject, secondProject) =>
      +new Date(secondProject.date) - +new Date(firstProject.date),
  );
}

export async function readProjects(): Promise<Project[]> {
  const raw = await readFile(projectsFilePath, "utf8");
  const parsed = JSON.parse(raw) as Partial<ProjectsFile>;
  const projects = Array.isArray(parsed.projects) ? parsed.projects : [];

  return sortProjects(
    projects
      .filter((project): project is Project => Boolean(project && project.id))
      .map((project) => normalizeProject(project)),
  );
}

export async function writeProjects(projects: Project[]): Promise<void> {
  const payload: ProjectsFile = {
    projects: sortProjects(projects).map((project) =>
      normalizeProject(project),
    ),
  };

  await writeFile(
    projectsFilePath,
    `${JSON.stringify(payload, null, 2)}\n`,
    "utf8",
  );
}

export function createBlankProject(): Project {
  return normalizeProject({
    id: "",
    title: "",
    description: "",
    technologies: [],
    link: "Private",
    category: "",
    date: new Date().toISOString(),
    thumbnail: "",
    difficulty: 0,
    proudness: 0,
    features: [],
  });
}

function toDateKey(value: string): string {
  return new Date(value).toISOString().slice(0, 10);
}

function levelFromCount(count: number): 0 | 1 | 2 | 3 | 4 {
  if (count <= 0) return 0;
  if (count === 1) return 1;
  if (count <= 2) return 2;
  if (count <= 4) return 3;
  return 4;
}

function parseDate(value: string): Date {
  return new Date(value);
}

function startOfWeek(date: Date): Date {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  const day = copy.getDay();
  copy.setDate(copy.getDate() - day);
  return copy;
}

function endOfDay(date: Date): Date {
  const copy = new Date(date);
  copy.setHours(23, 59, 59, 999);
  return copy;
}

export function buildContributionItems(
  projects: Project[],
): ContributionItem[] {
  const projectItems = projects.flatMap((project) => {
    const items: ContributionItem[] = [
      {
        id: `project:${project.id}`,
        title: project.title,
        description: project.description,
        date: project.date,
        kind: "project",
        href: `/projects/${project.id}`,
        label: project.category,
      },
    ];

    if (project.versions && project.versions.length > 0) {
      for (const version of project.versions) {
        items.push({
          id: `release:${project.id}:${version.id}`,
          title: version.title,
          description: version.description,
          date: version.date,
          kind: "release",
          href: `/projects/${project.id}`,
          label: version.id,
        });
      }
    }

    return items;
  });

  return [...milestoneItems, ...projectItems].sort(
    (left, right) =>
      parseDate(left.date).getTime() - parseDate(right.date).getTime(),
  );
}

export function buildContributionWeeks(
  items: ContributionItem[],
  referenceDate: Date = new Date(),
): ContributionWeek[] {
  const normalizedReference = endOfDay(referenceDate);

  const firstDate =
    items.length > 0
      ? new Date(
          Math.min(...items.map((item) => parseDate(item.date).getTime())),
        )
      : new Date(normalizedReference.getFullYear(), 0, 1);

  const cursorStart = startOfWeek(firstDate);
  const cursorEnd = normalizedReference;
  const itemMap = new Map<string, ContributionItem[]>();

  for (const item of items) {
    const key = toDateKey(item.date);
    const existing = itemMap.get(key) ?? [];
    existing.push(item);
    itemMap.set(key, existing);
  }

  const weeks: ContributionWeek[] = [];
  const cursor = new Date(cursorStart);

  while (cursor <= cursorEnd) {
    const cells: ContributionCell[] = [];
    let monthLabel: string | undefined;

    for (let index = 0; index < 7; index += 1) {
      const day = new Date(cursor);
      const key = toDateKey(day.toISOString());
      const dayItems = itemMap.get(key) ?? [];

      if (!monthLabel && day.getDate() === 1) {
        monthLabel = day.toLocaleString("en-US", { month: "short" });
      }

      cells.push({
        date: day.toISOString(),
        count: dayItems.length,
        level: levelFromCount(dayItems.length),
        items: dayItems,
      });

      cursor.setDate(cursor.getDate() + 1);
    }

    weeks.push({
      label: monthLabel,
      cells,
    });
  }

  return weeks;
}

export function buildContributionStats(
  items: ContributionItem[],
): ContributionStats {
  const sorted = [...items].sort(
    (left, right) =>
      parseDate(left.date).getTime() - parseDate(right.date).getTime(),
  );

  const dayCounts = new Map<string, number>();

  for (const item of sorted) {
    const key = toDateKey(item.date);
    dayCounts.set(key, (dayCounts.get(key) ?? 0) + 1);
  }

  return {
    totalItems: sorted.length,
    activeDays: dayCounts.size,
    totalCount: sorted.length,
    firstDate: sorted[0]?.date,
    lastDate: sorted[sorted.length - 1]?.date,
  };
}

export function groupContributionItemsByYear(items: ContributionItem[]): Array<{
  year: string;
  items: ContributionItem[];
}> {
  const grouped = new Map<string, ContributionItem[]>();

  for (const item of items) {
    const year = new Date(item.date).getFullYear().toString();
    const existing = grouped.get(year) ?? [];
    existing.push(item);
    grouped.set(year, existing);
  }

  return [...grouped.entries()]
    .map(([year, yearItems]) => ({
      year,
      items: yearItems.sort(
        (left, right) =>
          parseDate(left.date).getTime() - parseDate(right.date).getTime(),
      ),
    }))
    .sort((left, right) => Number(left.year) - Number(right.year));
}
