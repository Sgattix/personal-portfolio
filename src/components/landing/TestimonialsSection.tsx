import { AnimatedTestimonials } from "../ui/animated-testimonials";
import Header from "../ui/header";

function TestimonialsSection() {
  return (
    <section
      id="testimonials"
      className="min-h-screen flex flex-col mx-auto px-4 w-full max-w-7xl pt-24 pb-16"
    >
      <Header title="Testimonials" subtitle="INFOS" />
      <AnimatedTestimonials
        testimonials={[
          {
            name: "CrystalNico",
            quote:
              "I would surely hire again! Sgattix was professional, efficient, and delivered high-quality work on time.",
            designation: "Minecraft Server Owner",
            src: "https://cdn.discordapp.com/avatars/986647521323544606/0edfb0a07bed4ec5e8ae2f063a5e9db4.webp?size=1024",
          },
          {
            name: "KuraiSpike",
            quote:
              "They are an excellent team, ready to answer any question to help create your server. Always available and professional.",
            designation: "Minecraft Server Owner",
            src: "https://cdn.discordapp.com/avatars/751478871420960860/224e44b1b126fae98ea739ec66a560cf.webp?size=1024",
          },
          {
            name: "X_bloodmon_X",
            quote:
              "In my opinion, Sgattix is the best staff member I've seen. He's very kind and can help you with anything. He doesn't deserve a 10 — he deserves a 1,000,000.",
            designation: "Minecraft Server Owner",
            src: "https://cdn.discordapp.com/avatars/1143277111197573171/ec42b663955e0f2422721606dbdb8aef.webp?size=1024",
          },
          {
            name: "Airijko",
            quote:
              "The developers are amzing and the plugin works great and is simple. I suggest you guys add a toggle global chat to send messages without needing the prefix if possible",
            designation: "Minecraft Server Owner",
          },
          {
            name: "UnCertoMirkuzz",
            quote:
              "Great plugin, I was recommended and I immediately tried it and I immediately liked it. Congratulations on the work.",
            designation: "Minecraft Server Owner",
          },
          {
            name: "Raffymimi",
            quote:
              "Best GlobalChat Plugin. It works perfectly. You save me from BungeeChat settings. Thanks.",
            designation: "Minecraft Server Owner",
          },
        ]}
      />
    </section>
  );
}

export default TestimonialsSection;
