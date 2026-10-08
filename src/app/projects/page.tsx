import Header from "@/components/ui/header";
import ProjectCard from "@/components/project/ProjectCard";
import { readProjects } from "@/lib/project-data";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import ProjectControls from "@/components/ProjectControls";

export const dynamic = "force-dynamic";

async function Page({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const projects = await readProjects(await isAdminAuthenticated());

  const selectedCategory = (await searchParams).category as string | undefined;
  const selectedSort = (await searchParams).sort as string | undefined;

  const sortedProjects = [...projects].sort((a, b) => {
    if (selectedSort === "newest") {
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    } else if (selectedSort === "oldest") {
      return new Date(a.date).getTime() - new Date(b.date).getTime();
    }
    const aVal = a[selectedSort as keyof typeof a];
    const bVal = b[selectedSort as keyof typeof b];

    if (!aVal || !bVal) {
      return 0;
    }
    return aVal > bVal ? 1 : -1;
  });

  const filteredProjects = selectedCategory
    ? sortedProjects.filter((project) => project.category === selectedCategory)
    : sortedProjects;

  return (
    <div className="bg-black min-h-screen">
      <div className="absolute -z-0 w-screen h-screen overflow-hidden bg-linear-to-bl from-neutral-700 via-black to-black"></div>
      <div className="max-w-full px-[17%] mx-auto relative z-10">
        <main className="pt-28">
          <div className="flex justify-between items-center">
            <Header title="My Projects" subtitle="PROJECTS" />
            <div className="flex gap-4">
              <ProjectControls
                selectedSort={selectedSort}
                selectedCategory={selectedCategory}
                projects={projects}
              />
            </div>
          </div>

          <section className="grid grid-cols-3 gap-5">
            {filteredProjects.map((project, i) => (
              <ProjectCard project={project} key={i} />
            ))}
          </section>
        </main>
      </div>
    </div>
  );
}

export default Page;
