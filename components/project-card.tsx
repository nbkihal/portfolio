import Link from "next/link";
import { ArrowUpRight, Github } from "lucide-react";

import type { Project } from "@/content/site-data";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { LightCard } from "@/components/light-card";
import { ProjectShowcase } from "@/components/project-showcase";

interface ProjectCardProps {
  project: Project;
  /** Position in the full project list (drives the decorative number). */
  index: number;
  /** Bigger title + rotating light beam. Defaults to `size === "lg"`. */
  featured?: boolean;
}

export function ProjectCard({
  project,
  index,
  featured = project.size === "lg",
}: ProjectCardProps) {
  const shots = project.shots ?? [];

  return (
    <LightCard
      tilt={featured ? 3 : 6}
      beam={featured}
      className={cn(
        "flex h-full min-h-[15rem] flex-col",
        featured && shots.length > 0 && "lg:flex-row",
      )}
    >
      {/* Decorative index number */}
      <span className="pointer-events-none absolute -right-3 -top-6 font-display text-8xl font-bold text-foreground/[0.04] transition-all duration-500 group-hover:text-brand/20 group-hover:drop-shadow-[0_0_24px_hsl(var(--brand)/0.6)]">
        {String(index + 1).padStart(2, "0")}
      </span>

      {shots.length > 0 ? (
        featured ? (
          // Featured: devices beside the text on wide screens.
          <div className="relative order-first p-6 pb-0 lg:order-last lg:w-1/2 lg:self-center lg:p-8 lg:pl-0">
            <ProjectShowcase shots={shots} />
          </div>
        ) : (
          // Regular: devices peek out of a lit header strip.
          <div className="relative h-56 overflow-hidden border-b bg-gradient-to-b from-brand/[0.08] to-transparent px-8 pt-7">
            <ProjectShowcase shots={shots} />
            <div
              aria-hidden
              className="pointer-events-none absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-card to-transparent"
            />
          </div>
        )
      ) : null}

      <div className="relative flex flex-1 flex-col p-6">
        <div className="mb-3 flex items-center gap-2 text-brand">
          <ArrowUpRight className="size-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          <span className="text-xs font-medium uppercase tracking-widest">
            Read case study
          </span>
        </div>

        <h3
          className={
            featured
              ? "font-display text-2xl font-bold leading-tight md:text-3xl"
              : "font-display text-xl font-bold leading-tight"
          }
        >
          {project.title}
        </h3>

        <p className="mt-3 max-w-xl flex-1 text-sm text-muted-foreground md:text-base">
          {project.description}
        </p>

        <div className="mt-5 flex flex-wrap items-center gap-2">
          {project.tech.map((tech) => (
            <Badge key={tech} variant="secondary" className="font-normal">
              {tech}
            </Badge>
          ))}
        </div>

        {project.githubUrl ? (
          <a
            href={project.githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="relative z-20 mt-5 inline-flex w-fit items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <Github className="size-4" />
            View on GitHub
          </a>
        ) : null}
      </div>

      {/* Full-card link to the project page (kept under the GitHub link
          via z-index). */}
      <Link
        href={`/projects/${project.id}`}
        aria-label={`Read case study: ${project.title}`}
        className="absolute inset-0 z-10 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      />
    </LightCard>
  );
}
