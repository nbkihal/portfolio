import Link from "next/link";
import { ArrowRight } from "lucide-react";

import {
  featuredProjectCount,
  projects,
  type ProjectSize,
} from "@/content/site-data";
import { Section, SectionHeading } from "@/components/section";
import { Reveal } from "@/components/reveal";
import { AmbientLights } from "@/components/ambient-lights";
import { ProjectCard } from "@/components/project-card";
import { Button } from "@/components/ui/button";

const sizeClasses: Record<ProjectSize, string> = {
  lg: "md:col-span-2 lg:col-span-4",
  md: "md:col-span-1 lg:col-span-2",
};

export function Projects() {
  const featured = projects.slice(0, featuredProjectCount);
  const remaining = projects.length - featured.length;

  return (
    <Section id="projects" className="relative overflow-hidden">
      <AmbientLights />

      <div className="container relative">
        <SectionHeading
          eyebrow="Selected Work"
          title="Things I've shipped"
          description="A mix of client work, team products, and experiments. Open any card for the full story — problem, build, and outcome."
        />

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-6">
          {featured.map((project, i) => (
            <Reveal
              key={project.id}
              delay={(i % 3) * 0.08}
              className={sizeClasses[project.size]}
            >
              <ProjectCard project={project} index={i} />
            </Reveal>
          ))}
        </div>

        {remaining > 0 ? (
          <Reveal
            delay={0.1}
            className="mt-12 flex flex-col items-center gap-3"
          >
            <Button
              asChild
              size="lg"
              variant="outline"
              className="group rounded-full border-brand/40 px-8 hover:border-brand hover:shadow-[0_0_30px_-6px_hsl(var(--brand)/0.7)]"
            >
              <Link href="/projects">
                See all {projects.length} projects
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
            <p className="text-sm text-muted-foreground">
              {remaining} more in the full archive, with filters
            </p>
          </Reveal>
        ) : null}
      </div>
    </Section>
  );
}
