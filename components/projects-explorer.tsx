"use client";

import * as React from "react";
import { AnimatePresence, LayoutGroup, motion } from "framer-motion";

import {
  projects,
  type Project,
  type ProjectCategory,
} from "@/content/site-data";
import { cn } from "@/lib/utils";
import { ProjectCard } from "@/components/project-card";

type Filter = "All" | ProjectCategory;

const CATEGORIES: ProjectCategory[] = [
  "Web",
  "Mobile",
  "AI",
  "Games",
  "Client & pro",
];

/** Filterable grid of every project, with animated re-ordering. */
export function ProjectsExplorer() {
  const [filter, setFilter] = React.useState<Filter>("All");

  const count = (f: Filter) =>
    f === "All"
      ? projects.length
      : projects.filter((p) => p.categories.includes(f)).length;
  const filters: Filter[] = ["All", ...CATEGORIES.filter((c) => count(c) > 0)];
  const visible: Array<{ project: Project; index: number }> = projects
    .map((project, index) => ({ project, index }))
    .filter(
      ({ project }) => filter === "All" || project.categories.includes(filter),
    );

  return (
    <>
      <LayoutGroup>
        <div
          role="toolbar"
          aria-label="Filter projects"
          className="mb-10 flex flex-wrap gap-2"
        >
          {filters.map((f) => {
            const active = f === filter;
            return (
              <button
                key={f}
                type="button"
                aria-pressed={active}
                onClick={() => setFilter(f)}
                className={cn(
                  "relative isolate inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand",
                  active
                    ? "border-transparent text-brand-foreground"
                    : "bg-background/50 text-muted-foreground hover:border-brand/50 hover:text-foreground",
                )}
              >
                {active ? (
                  <motion.span
                    layoutId="filter-pill"
                    className="absolute inset-0 -z-10 rounded-full bg-gradient-to-r from-brand to-cyan shadow-[0_0_24px_-4px_hsl(var(--brand)/0.8)]"
                    transition={{ type: "spring", stiffness: 400, damping: 32 }}
                  />
                ) : null}
                {f}
                <span
                  className={cn(
                    "rounded-full px-1.5 text-xs tabular-nums",
                    active ? "bg-white/20" : "bg-muted",
                  )}
                >
                  {count(f)}
                </span>
              </button>
            );
          })}
        </div>
      </LayoutGroup>

      <motion.ul layout className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence mode="popLayout" initial={false}>
          {visible.map(({ project, index }) => (
            <motion.li
              key={project.id}
              layout
              initial={{ opacity: 0, scale: 0.92, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              <ProjectCard project={project} index={index} featured={false} />
            </motion.li>
          ))}
        </AnimatePresence>
      </motion.ul>

      <p className="sr-only" aria-live="polite">
        Showing {visible.length} of {projects.length} projects
      </p>
    </>
  );
}
