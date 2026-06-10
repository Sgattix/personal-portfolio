import HeroSection from "@/components/landing/HeroSection";
import Navbar from "@/components/ui/Navbar";
import PageNav from "@/components/ui/PageNav";
import OverviewSection from "@/components/landing/OverviewSection";
import WorkExperienceSection from "@/components/landing/WorkExperienceSection";
import TestimonialsSection from "@/components/landing/TestimonialsSection";

export default function Home() {
  return (
    <div className="bg-black">
      <PageNav sections={["Overview", "Work Experience", "Testimonials"]} />
      <Navbar />
      <HeroSection />
      <OverviewSection />
      <WorkExperienceSection />
      <TestimonialsSection />
      <footer className="py-12 text-center text-neutral-500">
        <p>
          &copy; {new Date().getFullYear()} Alessandro Sgattoni. All rights
          reserved.
        </p>
      </footer>
    </div>
  );
}
