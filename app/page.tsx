import { Intro } from "@/components/sections/intro";
import { Hero } from "@/components/sections/hero";
import { TechMarquee } from "@/components/sections/tech-marquee";
import { About } from "@/components/sections/about";
import { Parcours } from "@/components/sections/parcours";
import { Services } from "@/components/sections/services";
import { ArchiveFolders } from "@/components/sections/archive-folders";
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
      <ArchiveFolders />
      <Testimonials />
      <Contact />
    </>
  );
}
