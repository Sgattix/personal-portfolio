import Link from "next/link";
import { IconBrandNodejs, IconBrandReact } from "@tabler/icons-react";
import PixelCard from "@/components/ui/PixelCard";
import Header from "../ui/header";
import { Button } from "../ui/button";

function OverviewSection() {
  return (
    <section
      id="overview"
      className="min-h-screen flex flex-col mx-auto px-4 w-full max-w-7xl pt-24 pb-16"
    >
      <Header title="Overview" subtitle="INFOS"></Header>
      <p className="text-neutral-400 max-w-3xl leading-relaxed text-lg">
        I am a passionate{" "}
        <span className="text-white font-semibold">software developer</span>{" "}
        with a strong background in building{" "}
        <span className="text-blue-500 font-semibold">
          scalable web applications
        </span>{" "}
        and <span className="text-blue-500 font-semibold">services</span>. With
        expertise in modern technologies such as{" "}
        <span className="text-blue-500 font-semibold">React</span>,{" "}
        <span className="text-blue-500 font-semibold">Node.js</span>, and{" "}
        <span className="text-blue-500 font-semibold">Java</span>, I strive to
        create <span className="text-white font-semibold">efficient</span> and{" "}
        <span className="text-white font-semibold">user-friendly</span>{" "}
        solutions. My experience spans various industries, allowing me to{" "}
        <span className="text-white font-semibold">adapt quickly</span> and
        deliver{" "}
        <span className="text-white font-semibold">high-quality results</span>.
        I am committed to{" "}
        <span className="text-blue-500 font-semibold">continuous learning</span>{" "}
        and staying updated with the latest trends in technology to provide{" "}
        <span className="text-white font-semibold">innovative solutions</span>{" "}
        that meet client needs.
      </p>

      <div className="mt-6 flex flex-wrap gap-3">
        <Button asChild className="bg-white text-black hover:bg-neutral-200">
          <Link href="/contributions">View all-time contributions</Link>
        </Button>
      </div>

      <div className="grid lg:grid-cols-4 grid-cols-1 mt-10">
        <PixelCard variant="blue">
          <p className="absolute p-5 text-white">
            <IconBrandReact size={64} className="mb-2 text-blue-500" />
            <span className="font-bold text-2xl">React</span>
            <br />
            <span className="text-neutral-300">
              I&apos;ve been building dynamic user interfaces with React.js for
              over 2 years.
            </span>
          </p>
        </PixelCard>
        <PixelCard variant="green">
          <p className="absolute p-5 text-white">
            <IconBrandNodejs size={64} className="mb-2 text-green-500" />
            <span className="font-bold text-2xl">Node.js</span>
            <br />
            <span className="text-neutral-300">
              I&apos;ve been creating scalable backend services with Node.js for
              over 4 years.
            </span>
          </p>
        </PixelCard>
        <PixelCard variant="pink">
          <p className="absolute p-5 text-white">
            <span className="font-bold text-2xl">Java</span>
            <br />
            <span className="text-neutral-300">
              I&apos;ve been developing robust applications using Java for over
              4 years.
            </span>
          </p>
        </PixelCard>
        <PixelCard variant="yellow">
          <p className="absolute p-5 text-white">
            <span className="font-bold text-2xl">
              Experiments with many web technologies
            </span>
            <br />
            <span className="text-neutral-300">
              I enjoy exploring and experimenting with various web technologies
              to expand my skill set.
            </span>
          </p>
        </PixelCard>
      </div>
    </section>
  );
}

export default OverviewSection;
