"use client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import type { Project } from "@/lib/project-types";
import { useState } from "react";

function ProjectCard({
  project,
  children,
}: {
  project: Project;
  children?: React.ReactNode;
}) {
  const { id, thumbnail, title, description, technologies, link } = project;
  const [isHovered, setIsHovered] = useState(false);
  return (
    <div
      key={id}
      className="bg-neutral-800 p-4 rounded-md mb-4 shadow-[-10px_10px_0_rgba(255,255,255,0.05)] hover:shadow-[-20px_20px_0_rgba(255,255,255,0.1)] transition-shadow duration-300 flex flex-col"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {thumbnail !== "" && (
        <Image
          src={
            thumbnail.endsWith(".gif") && isHovered
              ? thumbnail
              : thumbnail.replace(".gif", ".png")
          }
          alt={title}
          width={400}
          height={200}
          className="rounded-md mb-4"
          unoptimized={thumbnail.endsWith(".gif") ? true : false}
          loading="lazy"
        />
      )}
      {thumbnail === "" && (
        <div className="h-[200px] w-full bg-neutral-700 rounded-md mb-4" />
      )}
      <div className="">
        <h3 className="text-xl font-bold text-white">{title}</h3>
        <p className="text-neutral-400">{description}</p>
        <div className="mt-2">
          {technologies.map((tech) => (
            <Badge
              key={tech}
              className="text-sm text-neutral-300 bg-neutral-700 px-2 py-1 mr-2"
            >
              {tech}
            </Badge>
          ))}
        </div>
      </div>
      {link === "Private" && (
        <p className="text-sm text-neutral-500 my-2">
          This project is private or not available anymore.
        </p>
      )}
      <Button className="my-4 cursor-pointer" asChild>
        <Link href={`projects/${id}`}>View Project</Link>
      </Button>
      {children}
    </div>
  );
}

export default ProjectCard;
