import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import Header from "@/components/ui/header";
import ProjectCard from "@/components/project/ProjectCard";
import { readProjects } from "@/lib/project-data";

export const dynamic = "force-dynamic";

async function Page() {
  const filteredProjects = await readProjects();

  return (
    <div className="bg-black min-h-screen">
      <div className="absolute -z-0 w-screen h-screen overflow-hidden bg-linear-to-bl from-neutral-700 via-black to-black"></div>
      <div className="max-w-full px-[17%] mx-auto relative z-10">
        <main className="pt-28">
          <div className="flex justify-between items-center">
            <Header title="My Projects" subtitle="PROJECTS" />
            <div className="flex gap-4">
              <Select>
                <SelectTrigger className="bg-neutral-950 text-white border-0">
                  Sort By
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest</SelectItem>
                  <SelectItem value="oldest">Oldest</SelectItem>
                  <SelectItem value="mostPopular">Most Popular</SelectItem>
                </SelectContent>
              </Select>
              <Select>
                <SelectTrigger className="bg-neutral-950 text-white border-0">
                  Category
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="webDevelopment">
                    Web Development
                  </SelectItem>
                  <SelectItem value="mobileApps">Mobile Apps</SelectItem>
                  <SelectItem value="dataScience">Data Science</SelectItem>
                  <SelectItem value="machineLearning">
                    Machine Learning
                  </SelectItem>
                </SelectContent>
              </Select>
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
