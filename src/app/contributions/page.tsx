import Link from "next/link";

import Header from "@/components/ui/header";
import { Timeline, TimelineEntry } from "@/components/ui/timeline";
import { ContributionGraph } from "@/components/contributions/ContributionGraph";
import {
  buildContributionItems,
  buildContributionStats,
  buildContributionWeeks,
  groupContributionItemsByYear,
} from "@/lib/project-data";
import { readProjects } from "@/lib/project-data";

export const metadata = {
  title: "Alessandro Sgattoni | Contributions",
  description:
    "An archive of projects, release milestones, and major contributions over time.",
};

export const dynamic = "force-dynamic";

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default async function Page() {
  const projects = await readProjects();
  const items = buildContributionItems(projects);
  const stats = buildContributionStats(items);
  const weeks = buildContributionWeeks(items);
  const groupedByYear = groupContributionItemsByYear(items);

  const timelineData: TimelineEntry[] = groupedByYear.map(
    ({ year, items: yearItems }) => ({
      title: year,
      content: (
        <div className="space-y-4 text-white">
          <p className="text-sm text-neutral-400">
            {yearItems.length} recorded contribution
            {yearItems.length === 1 ? "" : "s"}.
          </p>

          <div className="grid gap-4 md:grid-cols-2">
            {yearItems.map((item) => (
              <article
                key={item.id}
                className="rounded-2xl border border-neutral-800 bg-neutral-950/50 p-4 transition-colors hover:border-neutral-600 hover:bg-neutral-950/80"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.3em] text-neutral-500">
                      {item.kind}
                    </p>
                    <h3 className="mt-2 text-lg font-semibold">{item.title}</h3>
                  </div>

                  {item.label && (
                    <span className="rounded-full border border-neutral-700 px-2 py-1 text-[10px] uppercase tracking-[0.25em] text-neutral-400">
                      {item.label}
                    </span>
                  )}
                </div>

                <p className="mt-3 text-sm leading-6 text-neutral-400">
                  {item.description}
                </p>

                <div className="mt-4 flex items-center justify-between gap-3 text-xs text-neutral-500">
                  <span>{formatDate(item.date)}</span>
                  {item.href ? (
                    <Link
                      href={item.href}
                      className="text-white underline underline-offset-4"
                    >
                      View related project
                    </Link>
                  ) : (
                    <span>Milestone</span>
                  )}
                </div>
              </article>
            ))}
          </div>
        </div>
      ),
    }),
  );

  return (
    <main className="min-h-screen bg-black px-6 py-10 text-neutral-100 md:px-10 lg:px-16 pt-32">
      <div className="mx-auto flex max-w-7xl flex-col gap-8">
        <section className="rounded-3xl border border-neutral-800 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.08),transparent_36%),linear-gradient(180deg,#0a0a0a_0%,#111111_100%)] p-6 shadow-2xl shadow-black/30">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <p className="text-xs uppercase tracking-[0.4em] text-neutral-500">
                Archive
              </p>
              <h1 className="mt-2 text-4xl font-semibold tracking-tight sm:text-5xl">
                All Time Contributions
              </h1>
              <p className="mt-3 text-sm leading-6 text-neutral-400 sm:text-base">
                A chronological archive of shipped projects, release milestones,
                and professional contributions. It is intentionally broader than
                the work experience section on the landing page.
              </p>
            </div>

            <div className="flex gap-3">
              <Link
                href="/projects"
                className="rounded-full border border-neutral-700 bg-neutral-950 px-4 py-2 text-sm text-neutral-100 transition hover:bg-neutral-800"
              >
                Browse projects
              </Link>
            </div>
          </div>
        </section>

        <ContributionGraph
          weeks={weeks}
          stats={stats}
          title="Project and contribution activity"
        />

        <section className="rounded-3xl border border-neutral-800 bg-neutral-900/70 p-6 shadow-2xl shadow-black/30 backdrop-blur">
          <Header title="Timeline" subtitle="CHRONOLOGY" />
          <Timeline data={timelineData} />
        </section>
      </div>
    </main>
  );
}
