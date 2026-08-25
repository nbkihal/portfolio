import { Trophy } from "lucide-react";

import { involvement } from "@/content/site-data";
import { Section } from "@/components/section";
import { Reveal } from "@/components/reveal";
import { Badge } from "@/components/ui/badge";

export function Involvement() {
  return (
    <Section id="involvement">
      <div className="container">
        <Reveal>
          <div className="relative overflow-hidden rounded-2xl border bg-card p-8 md:p-12">
            {/* Accent glow */}
            <div className="pointer-events-none absolute -right-16 -top-16 size-64 rounded-full bg-brand/10 blur-3xl" />

            <div className="relative">
              <span className="inline-flex items-center gap-2 text-sm font-medium uppercase tracking-widest text-brand">
                <span className="h-px w-6 bg-brand" />
                Involvement & Leadership
              </span>

              <h2 className="mt-4 font-display text-2xl font-bold tracking-tight md:text-4xl">
                {involvement.org}
              </h2>

              {/* Role trajectory */}
              <ol className="mt-8 flex flex-wrap items-center gap-x-2 gap-y-3">
                {involvement.timeline.map((role, i) => (
                  <li key={role} className="flex items-center gap-2">
                    <Badge variant="secondary" className="px-3 py-1 text-sm">
                      {role}
                    </Badge>
                    {i < involvement.timeline.length - 1 ? (
                      <span className="text-muted-foreground">→</span>
                    ) : null}
                  </li>
                ))}
              </ol>

              {/* Current campaign highlight */}
              <div className="mt-8 flex flex-col gap-3 rounded-xl border border-brand/30 bg-brand/5 p-5 sm:flex-row sm:items-center">
                <div className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-brand text-brand-foreground">
                  <Trophy className="size-5" />
                </div>
                <div>
                  <p className="font-display text-lg font-semibold">
                    {involvement.current}
                  </p>
                  <p className="text-muted-foreground">{involvement.body}</p>
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </Section>
  );
}
