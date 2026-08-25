"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight, Github, Maximize2, X } from "lucide-react";

import { projects, type Project, type ProjectSize } from "@/content/site-data";
import { Section, SectionHeading } from "@/components/section";
import { Reveal } from "@/components/reveal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const sizeClasses: Record<ProjectSize, string> = {
  lg: "md:col-span-2 lg:col-span-4",
  md: "md:col-span-1 lg:col-span-2",
};

export function Projects() {
  const [selected, setSelected] = React.useState<Project | null>(null);

  // Escape to close + lock body scroll while the case study is open.
  React.useEffect(() => {
    if (!selected) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSelected(null);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [selected]);

  return (
    <Section id="projects">
      <div className="container">
        <SectionHeading
          eyebrow="Selected Work"
          title="Things I've shipped"
          description="A mix of client work, team products, and experiments. Tap any card for the full story — problem, build, and outcome."
        />

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-6">
          {projects.map((project, i) => (
            <Reveal
              key={project.id}
              delay={(i % 3) * 0.08}
              className={sizeClasses[project.size]}
            >
              <ProjectCard
                project={project}
                index={i}
                onOpen={() => setSelected(project)}
              />
            </Reveal>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {selected ? (
          <CaseStudyModal
            project={selected}
            onClose={() => setSelected(null)}
          />
        ) : null}
      </AnimatePresence>
    </Section>
  );
}

/* ------------------------------------------------------------------- card */

function ProjectCard({
  project,
  index,
  onOpen,
}: {
  project: Project;
  index: number;
  onOpen: () => void;
}) {
  const featured = project.size === "lg";

  return (
    <div className="group relative flex h-full min-h-[15rem] flex-col overflow-hidden rounded-xl border bg-card p-6 transition-all hover:border-brand/50 hover:shadow-[0_0_40px_-12px_hsl(var(--brand)/0.4)]">
      {/* Decorative index number */}
      <span className="pointer-events-none absolute -right-3 -top-6 font-display text-8xl font-bold text-foreground/[0.04] transition-colors group-hover:text-brand/10">
        {String(index + 1).padStart(2, "0")}
      </span>

      <div className="relative flex flex-1 flex-col">
        <div className="mb-3 flex items-center gap-2 text-brand">
          <Maximize2 className="size-4" />
          <span className="text-xs font-medium uppercase tracking-widest">
            Case study
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
            onClick={(e) => e.stopPropagation()}
            className="relative z-20 mt-5 inline-flex w-fit items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <Github className="size-4" />
            View on GitHub
          </a>
        ) : null}
      </div>

      {/* Full-card overlay button opens the case study (kept out of the
          GitHub link's stacking context via z-index). */}
      <button
        type="button"
        onClick={onOpen}
        aria-label={`View case study: ${project.title}`}
        className="absolute inset-0 z-10 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      />
    </div>
  );
}

/* ------------------------------------------------------------------ modal */

function CaseStudyModal({
  project,
  onClose,
}: {
  project: Project;
  onClose: () => void;
}) {
  const closeRef = React.useRef<HTMLButtonElement>(null);

  React.useEffect(() => {
    closeRef.current?.focus();
  }, []);

  const blocks = [
    { label: "The problem", body: project.caseStudy.problem },
    { label: "What I built", body: project.caseStudy.build },
    { label: "Outcome", body: project.caseStudy.outcome },
  ];

  return (
    <motion.div
      className="fixed inset-0 z-[60] flex items-end justify-center overflow-y-auto bg-background/70 p-0 backdrop-blur-sm sm:items-center sm:p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-labelledby="case-study-title"
        onClick={(e) => e.stopPropagation()}
        initial={{ opacity: 0, y: 24, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 24, scale: 0.98 }}
        transition={{ duration: 0.25, ease: [0.21, 0.47, 0.32, 0.98] }}
        className="relative w-full max-w-2xl rounded-t-2xl border bg-card p-6 shadow-2xl sm:rounded-2xl sm:p-8"
      >
        <button
          ref={closeRef}
          type="button"
          onClick={onClose}
          aria-label="Close case study"
          className="absolute right-4 top-4 inline-flex size-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
        >
          <X className="size-5" />
        </button>

        <span className="text-xs font-medium uppercase tracking-widest text-brand">
          Case study
        </span>
        <h3
          id="case-study-title"
          className="mt-2 pr-8 font-display text-2xl font-bold leading-tight md:text-3xl"
        >
          {project.title}
        </h3>

        <div className="mt-4 flex flex-wrap gap-2">
          {project.tech.map((tech) => (
            <Badge key={tech} variant="brand" className="font-normal">
              {tech}
            </Badge>
          ))}
        </div>

        <div className="mt-8 flex flex-col gap-6">
          {blocks.map((block) => (
            <div key={block.label}>
              <h4 className="mb-1.5 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                {block.label}
              </h4>
              <p className="leading-relaxed">{block.body}</p>
            </div>
          ))}
        </div>

        {project.githubUrl || project.liveUrl ? (
          <div className="mt-8 flex flex-wrap gap-3 border-t pt-6">
            {project.githubUrl ? (
              <Button asChild variant="outline">
                <a
                  href={project.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Github className="size-4" />
                  View on GitHub
                </a>
              </Button>
            ) : null}
            {project.liveUrl ? (
              <Button asChild>
                <a
                  href={project.liveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Visit live site
                  <ArrowUpRight className="size-4" />
                </a>
              </Button>
            ) : null}
          </div>
        ) : null}
      </motion.div>
    </motion.div>
  );
}
