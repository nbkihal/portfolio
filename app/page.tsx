import { Intro } from "@/components/sections/intro";
import { Hero } from "@/components/sections/hero";
import { TechMarquee } from "@/components/sections/tech-marquee";
import { About } from "@/components/sections/about";
import { Parcours } from "@/components/sections/parcours";
import { Services } from "@/components/sections/services";
import { Projects } from "@/components/sections/projects";
import { Testimonials } from "@/components/sections/testimonials";
import { Contact } from "@/components/sections/contact";

export default function Home() {
  return (
    <>
      <Intro />
      <Hero />
      <TechMarquee />
      <About />
      <Parcours />
      <Services />
      <Projects />
      <Testimonials />
      <Contact />
    </>
  );
}
