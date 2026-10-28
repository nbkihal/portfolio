import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { projects } from "@/content/site-data";
import { AmbientLights } from "@/components/ambient-lights";
import { ProjectsExplorer } from "@/components/projects-explorer";
import { Reveal } from "@/components/reveal";

export const metadata: Metadata = {
  title: "All projects",
  description:
    "Every project I've shipped — web platforms, mobile games, AI systems and client work — with a case study for each.",
};

export default function ProjectsPage() {
  return (
    <div className="relative overflow-hidden">
      <AmbientLights />
      <div
        aria-hidden
        className="bg-dotted absolute inset-x-0 top-0 h-[32rem] opacity-50 [mask-image:linear-gradient(to_bottom,black,transparent)]"
      />

      <div className="container relative pb-24 pt-32 md:pt-40">
        <Reveal>
          <Link
            href="/#projects"
            className="group mb-10 inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-1" />
            Back home
          </Link>
        </Reveal>

        <Reveal delay={0.05}>
          <span className="inline-flex items-center gap-2 text-sm font-medium uppercase tracking-widest text-brand">
            <span className="h-px w-6 bg-brand" />
            Archive · {projects.length} projects
          </span>
        </Reveal>
        <Reveal delay={0.1}>
          <h1 className="mt-4 font-display text-4xl font-bold leading-[1.05] tracking-tight sm:text-5xl md:text-6xl">
            Everything <span className="text-gradient">I&apos;ve built</span>
          </h1>
        </Reveal>
        <Reveal delay={0.15}>
          <p className="mb-12 mt-5 max-w-2xl text-lg text-muted-foreground md:text-xl">
            Web platforms, mobile games, AI systems and client work. Filter by
            type, then open any card for the full case study.
          </p>
        </Reveal>

        <ProjectsExplorer />
      </div>
    </div>
  );
}
