import { MessageSquareQuote } from "lucide-react";

import { testimonials, testimonialsPlaceholder } from "@/content/site-data";
import { Section, SectionHeading } from "@/components/section";
import { Reveal } from "@/components/reveal";
import { LightCard } from "@/components/light-card";

export function Testimonials() {
  const hasTestimonials = testimonials.length > 0;

  return (
    <Section id="testimonials" className="bg-muted/30">
      <div className="container">
        <SectionHeading
          eyebrow="Testimonials"
          title="What people say"
          align="center"
          className="items-center text-center"
        />

        {hasTestimonials ? (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {testimonials.map((t, i) => (
              <Reveal
                key={`${t.name}-${i}`}
                delay={i * 0.08}
                className="h-full"
              >
                <LightCard className="flex h-full flex-col gap-4 p-6">
                  <MessageSquareQuote className="size-6 text-brand" />
                  <blockquote className="flex-1 text-lg leading-relaxed">
                    “{t.quote}”
                  </blockquote>
                  <figcaption className="mt-2">
                    <p className="font-semibold">{t.name}</p>
                    <p className="text-sm text-muted-foreground">{t.role}</p>
                  </figcaption>
                </LightCard>
              </Reveal>
            ))}
          </div>
        ) : (
          // Placeholder state — intentionally no fabricated quotes.
          <Reveal>
            <LightCard
              beam
              tilt={4}
              className="mx-auto flex max-w-md flex-col items-center gap-4 rounded-2xl py-14 text-center"
            >
              <div className="flex size-12 items-center justify-center rounded-full bg-brand/10 text-brand shadow-[0_0_24px_hsl(var(--brand)/0.35)]">
                <MessageSquareQuote className="size-6" />
              </div>
              <p className="text-lg font-medium text-muted-foreground">
                {testimonialsPlaceholder}
              </p>
            </LightCard>
          </Reveal>
        )}
      </div>
    </Section>
  );
}
