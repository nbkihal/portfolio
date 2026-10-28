import { Intro } from "@/components/sections/intro";
import { Hero } from "@/components/sections/hero";
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
      <About />
      <Parcours />
      <Services />
      <Projects />
      <Testimonials />
      <Contact />
    </>
  );
}
