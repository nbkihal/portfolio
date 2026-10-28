import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import { services } from "@/content/site-data";
import { icons } from "@/lib/icons";
import { Section, SectionHeading } from "@/components/section";
import { Reveal } from "@/components/reveal";
import { LightCard } from "@/components/light-card";

export function Services() {
  return (
    <Section id="services" className="bg-muted/30">
      <div className="container">
        <SectionHeading
          eyebrow="Services"
          title="What I can build for you"
          description="No fixed price lists — every project is scoped to what you actually need. Tell me the goal and I'll send a quote."
        />

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {services.map((service, i) => {
            const Icon = icons[service.icon];
            return (
              <Reveal key={service.title} delay={i * 0.08} className="h-full">
                <LightCard className="flex h-full flex-col gap-4 p-6">
                  <span
                    aria-hidden
                    className="pointer-events-none absolute right-4 top-3 font-display text-5xl font-bold text-foreground/[0.05] transition-all duration-500 group-hover:text-brand/20"
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div className="flex size-12 items-center justify-center rounded-lg bg-brand/10 text-brand transition-all duration-300 group-hover:bg-brand group-hover:text-brand-foreground group-hover:shadow-[0_0_24px_hsl(var(--brand)/0.7)]">
                    <Icon className="size-6" />
                  </div>
                  <h3 className="font-display text-lg font-semibold leading-tight">
                    {service.title}
                  </h3>
                  <p className="flex-1 text-sm text-muted-foreground">
                    {service.description}
                  </p>
                  <Link
                    href={service.cta.href}
                    className="inline-flex items-center gap-1 text-sm font-medium text-brand transition-colors hover:text-brand/80"
                  >
                    {service.cta.label}
                    <ArrowUpRight className="size-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                  </Link>
                </LightCard>
              </Reveal>
            );
          })}
        </div>
      </div>
    </Section>
  );
}
