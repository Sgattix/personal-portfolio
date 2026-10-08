import LogoLoop, { LogoItem } from "./LogoLoop";
import { Timeline } from "../ui/timeline";
import Header from "../ui/header";
import { timeline } from "@/app/config/timeline";
import logoLoop from "@/app/config/logo-loop-entries.json";

const logos: LogoItem[] = logoLoop.images.map((i) => ({
  src: i.src,
  alt: i.alt,
  width: 50,
  height: 75,
}));

function WorkExperienceSection() {
  return (
    <section
      id="work-experience"
      className="min-h-screen flex flex-col mx-auto px-4 w-full max-w-7xl pt-24 pb-16"
    >
      <Header title="Work Experience" subtitle="INFOS" />
      <Timeline data={timeline} />
      <LogoLoop logos={logos} />
    </section>
  );
}

export default WorkExperienceSection;
