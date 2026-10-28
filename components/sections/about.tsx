import { Quote } from "lucide-react";

import { about } from "@/content/site-data";
import { icons } from "@/lib/icons";
import { Section, SectionHeading } from "@/components/section";
import { Reveal } from "@/components/reveal";
import { LightCard } from "@/components/light-card";

export function About() {
  return (
    <Section id="about" className="relative overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute -right-40 top-10 size-[30rem] rounded-full bg-brand/10 blur-[120px]"
      />

      <div className="container relative">
        <div className="grid gap-10 md:grid-cols-[1fr_1.4fr] md:gap-16">
          <div className="md:sticky md:top-28 md:self-start">
            <SectionHeading
              eyebrow="About"
              title={
                <>
                  Real products,
                  <br />
                  <span className="text-gradient">not class assignments.</span>
                </>
              }
              className="mb-0"
            />
          </div>

          <div className="flex flex-col gap-5">
            <Reveal>
              <LightCard tilt={2} className="p-6 sm:p-8">
                <Quote className="mb-4 size-8 text-brand drop-shadow-[0_0_12px_hsl(var(--brand)/0.6)]" />
                <div className="flex flex-col gap-5">
                  {about.paragraphs.map((paragraph, i) => (
                    <p
                      key={i}
                      className={
                        i === 0
                          ? "text-lg leading-relaxed text-foreground md:text-xl"
                          : "leading-relaxed text-muted-foreground md:text-lg"
                      }
                    >
                      {paragraph}
                    </p>
                  ))}
                </div>
              </LightCard>
            </Reveal>

            <ul className="grid gap-5 sm:grid-cols-2">
              {about.highlights.map((highlight, i) => {
                const Icon = icons[highlight.icon];
                return (
                  <li key={highlight.label}>
                    <Reveal delay={0.05 + i * 0.06} className="h-full">
                      <LightCard className="flex h-full items-center gap-4 p-5">
                        <span className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-brand/10 text-brand transition-all duration-300 group-hover:bg-brand group-hover:text-brand-foreground group-hover:shadow-[0_0_24px_hsl(var(--brand)/0.7)]">
                          <Icon className="size-6" />
                        </span>
                        <span className="flex flex-col">
                          <span className="font-display font-semibold">
                            {highlight.label}
                          </span>
                          <span className="text-sm text-muted-foreground">
                            {highlight.detail}
                          </span>
                        </span>
                      </LightCard>
                    </Reveal>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </div>
    </Section>
  );
}
