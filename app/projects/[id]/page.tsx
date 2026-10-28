import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Github,
  Hammer,
  Target,
  Trophy,
} from "lucide-react";

import { projects } from "@/content/site-data";
import { AmbientLights } from "@/components/ambient-lights";
import { LightCard } from "@/components/light-card";
import { Reveal } from "@/components/reveal";
import { Button } from "@/components/ui/button";

interface ProjectPageProps {
  params: Promise<{ id: string }>;
}

export function generateStaticParams() {
  return projects.map((project) => ({ id: project.id }));
}

export async function generateMetadata({
  params,
}: ProjectPageProps): Promise<Metadata> {
  const { id } = await params;
  const project = projects.find((p) => p.id === id);
  if (!project) return {};
  return {
    title: project.title,
    description: project.description,
    openGraph: { title: project.title, description: project.description },
  };
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { id } = await params;
  const index = projects.findIndex((p) => p.id === id);
  if (index === -1) notFound();

  const project = projects[index];
  const prev = projects[(index - 1 + projects.length) % projects.length];
  const next = projects[(index + 1) % projects.length];
  // "Traveleo — Travel Agency Platform" → name + subtitle.
  const [name, subtitle] = project.title.split(" — ");
  const number = String(index + 1).padStart(2, "0");

  const steps = [
    { label: "The problem", body: project.caseStudy.problem, icon: Target },
    { label: "What I built", body: project.caseStudy.build, icon: Hammer },
    { label: "Outcome", body: project.caseStudy.outcome, icon: Trophy },
  ];

  return (
    <article className="relative overflow-hidden">
      <AmbientLights />
      <div
        aria-hidden
        className="bg-dotted absolute inset-x-0 top-0 h-[36rem] opacity-50 [mask-image:linear-gradient(to_bottom,black,transparent)]"
      />

      {/* ------------------------------------------------------------ header */}
      <header className="container relative pb-16 pt-32 md:pb-20 md:pt-40">
        <Reveal>
          <Link
            href="/#projects"
            className="group mb-10 inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-1" />
            All projects
          </Link>
        </Reveal>

        <div className="grid items-end gap-10 lg:grid-cols-[1.5fr_1fr]">
          <div>
            <Reveal delay={0.05}>
              <span className="inline-flex items-center gap-2 text-sm font-medium uppercase tracking-widest text-brand">
                <span className="h-px w-6 bg-brand" />
                Case study · {number}
              </span>
            </Reveal>
            <Reveal delay={0.1}>
              <h1 className="mt-4 font-display text-4xl font-bold leading-[1.05] tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
                <span className="text-gradient">{name}</span>
                {subtitle ? (
                  <span className="mt-2 block text-2xl text-foreground/80 sm:text-3xl md:text-4xl">
                    {subtitle}
                  </span>
                ) : null}
              </h1>
            </Reveal>
            <Reveal delay={0.15}>
              <p className="mt-6 max-w-2xl text-lg text-muted-foreground md:text-xl">
                {project.description}
              </p>
            </Reveal>
            {project.githubUrl || project.liveUrl ? (
              <Reveal delay={0.2}>
                <div className="mt-8 flex flex-wrap gap-3">
                  {project.liveUrl ? (
                    <Button asChild size="lg">
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
                  {project.githubUrl ? (
                    <Button
                      asChild
                      size="lg"
                      variant={project.liveUrl ? "outline" : "default"}
                    >
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
                </div>
              </Reveal>
            ) : null}
          </div>

          {/* Project file card */}
          <Reveal delay={0.2}>
            <LightCard beam tilt={6} className="rounded-2xl p-6 sm:p-8">
              <span
                aria-hidden
                className="pointer-events-none absolute -right-4 -top-10 font-display text-[9rem] font-bold leading-none text-brand/10 drop-shadow-[0_0_30px_hsl(var(--brand)/0.5)]"
              >
                {number}
              </span>
              <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
                Stack
              </p>
              <ul className="mt-4 flex flex-col gap-3">
                {project.tech.map((tech) => (
                  <li
                    key={tech}
                    className="flex items-center gap-3 font-medium"
                  >
                    <span className="size-2 rounded-full bg-cyan shadow-[0_0_8px_2px_hsl(var(--cyan)/0.7)]" />
                    {tech}
                  </li>
                ))}
              </ul>
              <div className="mt-6 border-t pt-4 text-sm text-muted-foreground">
                {project.size === "lg" ? "Featured build" : "Selected build"} ·{" "}
                {number} / {String(projects.length).padStart(2, "0")}
              </div>
            </LightCard>
          </Reveal>
        </div>
      </header>

      {/* -------------------------------------------------------- case study */}
      <section className="container relative pb-20 md:pb-28">
        <div className="relative mx-auto max-w-3xl">
          <div
            aria-hidden
            className="absolute bottom-8 left-6 top-8 w-px bg-gradient-to-b from-brand via-cyan to-brand/0 shadow-[0_0_10px_hsl(var(--brand))] md:left-7"
          />
          <ol className="flex flex-col gap-8">
            {steps.map((step, i) => {
              const Icon = step.icon;
              return (
                <li key={step.label} className="relative pl-16 md:pl-20">
                  <Reveal delay={i * 0.08} className="relative">
                    <span className="absolute -left-16 top-6 flex size-12 items-center justify-center rounded-full bg-gradient-to-br from-brand to-cyan text-white shadow-[0_0_24px_4px_hsl(var(--brand)/0.5)] md:-left-20 md:size-14">
                      <Icon className="size-5 md:size-6" />
                    </span>
                    <LightCard tilt={3} className="p-6 sm:p-8">
                      <p className="text-xs font-medium uppercase tracking-widest text-brand">
                        {String(i + 1).padStart(2, "0")} · {step.label}
                      </p>
                      <p className="mt-3 text-lg leading-relaxed md:text-xl">
                        {step.body}
                      </p>
                    </LightCard>
                  </Reveal>
                </li>
              );
            })}
          </ol>
        </div>
      </section>

      {/* ------------------------------------------------------- navigation */}
      <section className="container relative pb-24">
        <div className="grid gap-5 md:grid-cols-2">
          {[
            { project: prev, label: "Previous project", Icon: ArrowLeft },
            { project: next, label: "Next project", Icon: ArrowRight },
          ].map(({ project: p, label, Icon }, i) => (
            <Reveal key={label} delay={i * 0.08} className="h-full">
              <LightCard
                className={`flex h-full flex-col gap-2 p-6 ${i === 1 ? "md:items-end md:text-right" : ""}`}
              >
                <span className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-widest text-muted-foreground">
                  {i === 0 ? <Icon className="size-4" /> : null}
                  {label}
                  {i === 1 ? <Icon className="size-4" /> : null}
                </span>
                <span className="font-display text-xl font-bold leading-tight transition-colors group-hover:text-brand">
                  {p.title}
                </span>
                <Link
                  href={`/projects/${p.id}`}
                  aria-label={`${label}: ${p.title}`}
                  className="absolute inset-0 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
                />
              </LightCard>
            </Reveal>
          ))}
        </div>

        <Reveal delay={0.1}>
          <LightCard
            beam
            tilt={0}
            className="mt-10 flex flex-col items-center gap-5 rounded-2xl px-6 py-14 text-center"
          >
            <h2 className="font-display text-3xl font-bold tracking-tight md:text-4xl">
              Have a project like this in mind?
            </h2>
            <p className="max-w-xl text-muted-foreground">
              Tell me what you&apos;re trying to ship and I&apos;ll get back to
              you with a plan.
            </p>
            <Button asChild size="lg">
              <Link href="/#contact">
                Start a project
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          </LightCard>
        </Reveal>
      </section>
    </article>
  );
}
