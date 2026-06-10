import Link from "next/link";
import { notFound } from "next/navigation";
import { redirect } from "next/navigation";

import { ProjectThumbnailField } from "@/components/admin/project-thumbnail-field";
import { GalleryField } from "@/components/admin/gallery-field";
import { TagsField } from "@/components/admin/tags-field";
import { ProjectDateField } from "@/components/admin/project-date-field";
import { Button } from "@/components/ui/button";
import { readProjects, createBlankProject } from "@/lib/project-data";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { saveProjectAction } from "../../actions";
import { FeaturesEditor } from "@/components/admin/features-editor";
import { VersionsEditor } from "@/components/admin/versions-editor";

export const dynamic = "force-dynamic";

export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ error?: string; saved?: string }>;
}) {
  const authenticated = await isAdminAuthenticated();

  if (!authenticated) {
    redirect("/admin/login");
  }

  const { id } = await params;
  const paramsData = searchParams ? await searchParams : undefined;
  const projects = await readProjects();
  const project =
    id === "new"
      ? createBlankProject()
      : projects.find((item) => item.id === id);

  if (!project) {
    notFound();
  }

  const isNewProject = id === "new";

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.08),transparent_36%),linear-gradient(180deg,#0a0a0a_0%,#111111_100%)] px-6 py-10 text-neutral-100 md:px-10 lg:px-16 pt-40">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-wrap items-start justify-between gap-6">
          <div className="max-w-3xl">
            <p className="text-xs uppercase tracking-[0.4em] text-neutral-500">
              {isNewProject ? "Create project" : "Edit project"}
            </p>
            <h1 className="mt-2 text-4xl font-semibold tracking-tight sm:text-5xl">
              {isNewProject ? "New project" : project.title}
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-neutral-400 sm:text-base">
              Edit the portfolio entry, upload a new thumbnail, and keep the
              project data file in sync.
            </p>
          </div>

          <Button
            asChild
            variant="outline"
            className="border-neutral-700 bg-transparent text-neutral-100 hover:bg-neutral-800"
          >
            <Link href="/admin">Back</Link>
          </Button>
        </div>

        {paramsData?.error === "invalid-versions" && (
          <p className="mb-6 rounded-2xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            Versions must be valid JSON.
          </p>
        )}
        {paramsData?.error === "missing-fields" && (
          <p className="mb-6 rounded-2xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            Fill in all required fields before saving.
          </p>
        )}
        {paramsData?.saved === "1" && (
          <p className="mb-6 rounded-2xl border border-emerald-500/40 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
            Project saved.
          </p>
        )}

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(280px,0.65fr)]">
          <form
            id="project-form"
            action={saveProjectAction}
            method="post"
            encType="multipart/form-data"
            className="space-y-6 rounded-3xl border border-neutral-800 bg-neutral-900/70 p-6 shadow-2xl shadow-black/30"
          >
            <input
              type="hidden"
              name="originalId"
              value={isNewProject ? "" : project.id}
            />
            <input
              type="hidden"
              name="returnTo"
              value={
                isNewProject
                  ? "/admin/projects/new"
                  : `/admin/projects/${project.id}`
              }
            />

            <section className="space-y-4 rounded-2xl border border-neutral-800 bg-neutral-950/30 p-5">
              <div>
                <h2 className="text-lg font-semibold text-neutral-100">
                  Core details
                </h2>
                <p className="text-sm text-neutral-400">
                  Keep the identity and metadata in one place.
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <label className="space-y-2">
                  <span className="text-sm text-neutral-300">ID</span>
                  <input
                    name="id"
                    defaultValue={project.id}
                    className="w-full rounded-2xl border border-neutral-700 bg-neutral-950 px-4 py-3 text-sm outline-none transition focus:border-white"
                  />
                </label>
                <label className="space-y-2">
                  <span className="text-sm text-neutral-300">Title</span>
                  <input
                    name="title"
                    defaultValue={project.title}
                    className="w-full rounded-2xl border border-neutral-700 bg-neutral-950 px-4 py-3 text-sm outline-none transition focus:border-white"
                  />
                </label>
                <label className="space-y-2">
                  <span className="text-sm text-neutral-300">Category</span>
                  <input
                    name="category"
                    defaultValue={project.category}
                    className="w-full rounded-2xl border border-neutral-700 bg-neutral-950 px-4 py-3 text-sm outline-none transition focus:border-white"
                  />
                </label>
                <ProjectDateField initialValue={project.date} />
              </div>
            </section>

            <section className="space-y-4 rounded-2xl border border-neutral-800 bg-neutral-950/30 p-5">
              <div>
                <h2 className="text-lg font-semibold text-neutral-100">
                  Story and links
                </h2>
                <p className="text-sm text-neutral-400">
                  Explain the project and keep external references current.
                </p>
              </div>

              <label className="block space-y-2">
                <span className="text-sm text-neutral-300">Description</span>
                <textarea
                  name="description"
                  rows={5}
                  defaultValue={project.description}
                  className="w-full rounded-2xl border border-neutral-700 bg-neutral-950 px-4 py-3 text-sm outline-none transition focus:border-white"
                />
              </label>

              <div className="grid gap-4 md:grid-cols-2">
                <label className="space-y-2">
                  <span className="text-sm text-neutral-300">Link</span>
                  <input
                    name="link"
                    defaultValue={project.link}
                    className="w-full rounded-2xl border border-neutral-700 bg-neutral-950 px-4 py-3 text-sm outline-none transition focus:border-white"
                  />
                </label>
                <label className="space-y-2">
                  <span className="text-sm text-neutral-300">Repository</span>
                  <input
                    name="repository"
                    defaultValue={project.repository ?? ""}
                    className="w-full rounded-2xl border border-neutral-700 bg-neutral-950 px-4 py-3 text-sm outline-none transition focus:border-white"
                  />
                </label>
              </div>
            </section>

            <section className="space-y-4 rounded-2xl border border-neutral-800 bg-neutral-950/30 p-5">
              <div>
                <h2 className="text-lg font-semibold text-neutral-100">
                  Metrics
                </h2>
                <p className="text-sm text-neutral-400">
                  Keep the rating values aligned with the rest of the list.
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <label className="space-y-2">
                  <span className="text-sm text-neutral-300">Proudness</span>
                  <input
                    name="proudness"
                    type="number"
                    step="0.1"
                    defaultValue={project.proudness}
                    className="w-full rounded-2xl border border-neutral-700 bg-neutral-950 px-4 py-3 text-sm outline-none transition focus:border-white"
                  />
                </label>
                <label className="space-y-2">
                  <span className="text-sm text-neutral-300">Difficulty</span>
                  <input
                    name="difficulty"
                    type="number"
                    step="0.1"
                    defaultValue={project.difficulty}
                    className="w-full rounded-2xl border border-neutral-700 bg-neutral-950 px-4 py-3 text-sm outline-none transition focus:border-white"
                  />
                </label>
              </div>
            </section>

            <section className="space-y-4 rounded-2xl border border-neutral-800 bg-neutral-950/30 p-5">
              <div>
                <h2 className="text-lg font-semibold text-neutral-100">
                  Content blocks
                </h2>
                <p className="text-sm text-neutral-400">
                  These fields are line-based to keep editing fast.
                </p>
              </div>

              <ProjectThumbnailField
                projectId={project.id}
                initialThumbnail={project.thumbnail}
              />

              <GalleryField />

              <div>
                <span className="text-sm text-neutral-300">Technologies</span>
                <div className="mt-2">
                  <TagsField initialTags={project.technologies} />
                </div>
              </div>

              <FeaturesEditor initial={project.features} />

              <div>
                <span className="text-sm text-neutral-300">Versions</span>
                <div className="mt-2">
                  <VersionsEditor initial={project.versions} />
                </div>
              </div>
            </section>

            <div className="flex flex-wrap gap-3">
              <Button
                type="submit"
                className="bg-white text-black hover:bg-neutral-200"
              >
                Save project
              </Button>
              <Button
                asChild
                variant="outline"
                className="border-neutral-700 bg-transparent text-neutral-100 hover:bg-neutral-800"
              >
                <Link href="/admin">Cancel</Link>
              </Button>
            </div>
          </form>

          <aside className="space-y-4">
            <section className="sticky top-6 space-y-4 rounded-3xl border border-neutral-800 bg-neutral-900/70 p-5 shadow-xl shadow-black/20">
              <div>
                <p className="text-xs uppercase tracking-[0.35em] text-neutral-500">
                  Quick view
                </p>
                <h2 className="mt-2 text-lg font-semibold text-neutral-100">
                  {project.title || "Untitled project"}
                </h2>
                <p className="mt-1 text-sm text-neutral-400">
                  {project.category || "No category yet"}
                </p>
              </div>

              <div className="space-y-2 rounded-2xl border border-neutral-800 bg-neutral-950/70 p-4 text-sm text-neutral-300">
                <div className="flex items-center justify-between gap-4">
                  <span className="text-neutral-500">Project ID</span>
                  <span className="font-medium text-neutral-100">
                    {project.id || "new-project"}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span className="text-neutral-500">Technologies</span>
                  <span className="font-medium text-neutral-100">
                    {project.technologies.length}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span className="text-neutral-500">Features</span>
                  <span className="font-medium text-neutral-100">
                    {project.features.length}
                  </span>
                </div>
              </div>

              <div className="space-y-3 rounded-2xl border border-neutral-800 bg-neutral-950/50 p-4 text-sm text-neutral-400">
                <p className="font-medium text-neutral-100">Editing notes</p>
                <p>
                  Uploading a thumbnail writes a file into the matching public
                  image folder and keeps the existing JSON structure intact.
                </p>
                <p>
                  If you leave the dropzone empty, the text path below is used
                  as the thumbnail source.
                </p>
              </div>
            </section>
          </aside>
        </div>
      </div>
    </main>
  );
}
