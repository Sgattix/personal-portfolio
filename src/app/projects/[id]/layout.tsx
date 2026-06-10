import { readProjects } from "@/lib/project-data";
import { Metadata } from "next";

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const projects = await readProjects();
  const project = projects.find(
    (proj) => proj.id === id,
  ) as (typeof projects)[0];

  return {
    title: `${project.title} | Alessandro Sgattoni`,
    description:
      "Detailed view of a specific project including features, technologies used, and links.",
  };
}

function LayoutWrapper({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-neutral-900 text-white min-h-screen flex items-center justify-center">
      {children}
    </div>
  );
}

export default LayoutWrapper;
