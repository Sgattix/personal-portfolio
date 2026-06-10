import Link from "next/link";
import { redirect } from "next/navigation";

import { ContributionGraph } from "@/components/contributions/ContributionGraph";
import { Button } from "@/components/ui/button";
import { readProjects } from "@/lib/project-data";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { deleteProjectAction, logoutAction } from "./actions";
import ProjectCard from "@/components/project/ProjectCard";
import { Input } from "@/components/ui/input";
import {
  buildContributionItems,
  buildContributionStats,
  buildContributionWeeks,
} from "@/lib/project-data";

export const dynamic = "force-dynamic";

export default async function Page({
  searchParams,
}: {
  searchParams?: Promise<{
    deleted?: string;
    error?: string;
    saved?: string;
    search?: string;
  }>;
}) {
  const authenticated = await isAdminAuthenticated();

  if (!authenticated) {
    redirect("/admin/login");
  }

  const projects = await readProjects();
  const contributionItems = buildContributionItems(projects);
  const contributionStats = buildContributionStats(contributionItems);
  const contributionWeeks = buildContributionWeeks(contributionItems);
  const params = searchParams ? await searchParams : undefined;

  const sortedProjects = projects.sort((a, b) => {
    const dateA = new Date(a.date);
    const dateB = new Date(b.date);
    return dateB.getTime() - dateA.getTime();
  });

  const search = params?.search ? params.search.toLowerCase() : undefined;

  const filteredProjects = search
    ? sortedProjects.filter((project) =>
        project.title.toLowerCase().includes(search),
      )
    : sortedProjects;

  return (
    <main className="min-h-screen bg-neutral-950 px-6 py-10 text-neutral-100 md:px-10 lg:px-16 pt-40">
      <div className="mx-auto flex max-w-7xl flex-col gap-8">
        <section className="rounded-3xl border border-neutral-800 bg-neutral-900/70 p-6 shadow-2xl shadow-black/30 backdrop-blur">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.4em] text-neutral-400">
                Admin
              </p>
              <h1 className="mt-2 text-4xl font-bold">Project CMS</h1>
              <p className="mt-2 max-w-2xl text-sm text-neutral-400">
                Manage the portfolio content from one place. Changes are written
                directly to the project data file that powers the public pages.
              </p>
            </div>

            <div className="flex gap-3">
              <Button asChild variant="secondary">
                <Link href="/admin/projects/new">New project</Link>
              </Button>
              <form action={logoutAction}>
                <Button type="submit" variant="destructive">
                  Logout
                </Button>
              </form>
            </div>
          </div>
          <form method="GET">
            <Input
              className="mt-4 border border-neutral-600 bg-neutral-800 text-neutral-400 placeholder:text-neutral-500"
              placeholder="Search projects..."
              defaultValue={params?.search ?? ""}
              name="search"
            />
          </form>

          {params?.saved === "1" && (
            <p className="mt-5 rounded-2xl border border-emerald-500/40 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
              Project saved.
            </p>
          )}
          {params?.deleted === "1" && (
            <p className="mt-5 rounded-2xl border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-300">
              Project deleted.
            </p>
          )}
          {params?.error && (
            <p className="mt-5 rounded-2xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              Something went wrong while processing the request.
            </p>
          )}
        </section>

        <section className="rounded-3xl border border-neutral-800 bg-neutral-900/70 p-6 shadow-2xl shadow-black/30 backdrop-blur">
          <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-neutral-500">
                Archive preview
              </p>
              <h2 className="mt-2 text-2xl font-semibold text-white">
                Contributions graph
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-neutral-400">
                A compact view of the same timeline that powers the public
                archive page.
              </p>
            </div>

            <Link
              href="/contributions"
              className="text-sm text-white underline underline-offset-4"
            >
              Open full archive
            </Link>
          </div>

          <ContributionGraph
            weeks={contributionWeeks}
            stats={contributionStats}
            compact
            title="Recent activity"
          />
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filteredProjects.map((project) => (
            <ProjectCard project={project} key={project.id}>
              <div className="mt-5 flex items-center gap-3">
                <Button
                  asChild
                  className="bg-white text-black hover:bg-neutral-200"
                >
                  <Link href={`/admin/projects/${project.id}`}>Edit</Link>
                </Button>

                <form action={deleteProjectAction}>
                  <input type="hidden" name="id" value={project.id} />
                  <Button
                    type="submit"
                    variant="destructive"
                    className="cursor-pointer"
                  >
                    Delete
                  </Button>
                </form>
              </div>
            </ProjectCard>
          ))}
        </section>
      </div>
    </main>
  );
}
