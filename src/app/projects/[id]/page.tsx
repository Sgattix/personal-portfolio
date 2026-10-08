import moment from "moment";
import Link from "next/link";
import Rating from "@/components/ui/Rating";
import ProjectCarousel from "@/components/ui/ProjectCarousel";
import Header from "@/components/ui/header";
import { Badge } from "@/components/ui/badge";
import { readProjects } from "@/lib/project-data";
import Image from "next/image";
import { notFound } from "next/navigation";
import { isAdminAuthenticated } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

async function Page({ params }: { params: { id: string } }) {
  params = await params;
  const projects = await readProjects(await isAdminAuthenticated());
  const project = projects.find(
    (proj) => proj.id === params.id,
  ) as (typeof projects)[0];

  if (!project) {
    notFound();
  }

  const {
    title,
    category,
    description,
    features,
    technologies,
    link,
    date,
    proudness,
    difficulty,
    versions,
  } = project;

  return (
    <div className="px-8 md:px-12 lg:px-20 py-10 max-w-7xl mx-auto bg-neutral-950 rounded-4xl h-full mb-20 mt-32">
      <div className="my-16 flex justify-between items-center flex-col md:flex-row gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold">{title}</h1>
          <p className="text-sm text-muted-foreground mt-2 uppercase tracking-widest">
            {category.replace("-", " ")}
          </p>
        </div>

        {/* Github Repo stats fetched */}
        <Link
          className="flex gap-4 mt-4"
          href={`https://github.com/Sgattix/${params.id}`}
          target="_blank"
        >
          <Image
            src={`https://img.shields.io/github/stars/Sgattix/${params.id}?style=social`}
            alt="GitHub stars"
            width={100}
            height={20}
            className="rounded-lg"
            unoptimized
          />
          <Image
            src={`https://img.shields.io/github/forks/Sgattix/${params.id}?style=social`}
            alt="GitHub forks"
            width={100}
            height={20}
            className="rounded-lg"
            unoptimized
          />
          <Image
            src={`https://img.shields.io/github/issues/Sgattix/${params.id}?style=social`}
            alt="GitHub issues"
            width={100}
            height={20}
            className="rounded-lg"
            unoptimized
          />
        </Link>
      </div>
      <div className="grid gap-8 lg:grid-cols-3 items-start">
        <section className="lg:col-span-2 flex flex-col gap-16">
          <ProjectCarousel id={params.id} />
          {link && link === "Private" && (
            <div className="w-full min-h-64 border-2 border-muted-foreground border-dashed flex justify-center items-center flex-col rounded-lg">
              Sorry, this project&apos;s demo is not available
            </div>
          )}

          {/* Versioning */}
          {versions && (
            <div>
              <h2 className="text-2xl font-bold mb-4">Versions</h2>
              <div className="grid md:grid-cols-2 gap-4">
                {versions.map((version, index) => (
                  <Link
                    className="border border-neutral-800 rounded-lg p-4 bg-neutral-950/30 relative flex flex-col justify-between hover:bg-neutral-950/50 transition-colors"
                    href={`https://github.com/Sgattix/${params.id}/tree/v${version.id}`}
                    key={index}
                    target="_blank"
                  >
                    <div>
                      <Header
                        title={
                          version.title.split("-")[0] +
                          "-" +
                          version.title.split("-")[1]
                        }
                        subtitle={version.title.split("-")[2].toUpperCase()}
                        size="sm"
                      />
                      <p className="text-sm text-muted-foreground">
                        {version.description}
                      </p>
                    </div>
                    <div className="flex justify-between gap-2 my-2">
                      <p className="text-xs text-muted-foreground">
                        Released on:{" "}
                        {moment(version.date).format("MMMM Do YYYY")}
                      </p>
                      <Badge className="text-xs bg-neutral-800 text-neutral-300">
                        v{version.id}
                      </Badge>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </section>

        <aside className="space-y-4">
          <div className="col-span-3 rounded-lg border border-neutral-800 p-4 bg-neutral-950/30">
            <h3 className="text-2xl font-bold">Quick Info</h3>

            <div>
              <h3 className="text-md font-semibold">Notable Features</h3>
              {features && features.length > 0 ? (
                <ul className="mt-2 list-disc list-inside text-sm">
                  {features.map((feature: string, index: number) => (
                    <li key={index}>{feature}</li>
                  ))}
                </ul>
              ) : (
                <div className="text-sm text-muted-foreground">
                  No notable features available.
                </div>
              )}
            </div>
          </div>
          <div className="rounded-lg border border-neutral-800 p-4 bg-neutral-950/40">
            <h2 className="text-2xl font-bold">Project Details</h2>
            <p className="mt-2 text-sm">{description}</p>

            <div className="mt-4">
              <h3 className="text-sm font-medium">Technologies</h3>
              <div className="mt-2 flex flex-wrap gap-2">
                {technologies?.map((tech: string) => (
                  <span
                    key={tech}
                    className="px-2 py-1 rounded-md text-xs bg-neutral-800 text-neutral-200"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>

            <div className="mt-4 flex flex-col gap-2">
              {link && link !== "Private" ? (
                <Link
                  href={link}
                  target="_blank"
                  className="cursor-pointer w-full text-center py-1 bg-indigo-900 rounded-lg"
                >
                  View Project
                </Link>
              ) : link === "Private" ? (
                <div className="text-sm text-muted-foreground">
                  This project is private or not available anymore.
                </div>
              ) : null}

              {date && (
                <div className="text-xs mt-2">
                  Started on: {moment(date).format("MMMM Do YYYY")}
                </div>
              )}

              <div className="flex items-center mt-2">
                <span className="text-sm mr-2">Proudness:</span>
                <Rating value={proudness} />
              </div>

              <div className="flex items-center">
                <span className="text-sm mr-2">Difficulty:</span>
                <Rating value={difficulty} />
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

export default Page;
