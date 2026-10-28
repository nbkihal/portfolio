import Link from "next/link";
import { ArrowRight, ArrowDown } from "lucide-react";

import { hero } from "@/content/site-data";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/reveal";
import { HeroGlobe } from "@/components/hero-globe";
import { HeroPortrait } from "@/components/hero-portrait";
import { Typewriter } from "@/components/typewriter";

export function Hero() {
  return (
    <section
      id="top"
      className="relative flex min-h-[100svh] items-center overflow-hidden"
    >
      <div className="container relative py-28">
        <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
          <div className="max-w-2xl">
            <Reveal>
              <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-border bg-background/40 px-4 py-1.5 text-sm font-medium text-muted-foreground backdrop-blur">
                <span className="relative flex size-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand opacity-75" />
                  <span className="relative inline-flex size-2 rounded-full bg-brand" />
                </span>
                Available for freelance work · {hero.role}
              </p>
            </Reveal>

            <Reveal delay={0.05}>
              <h1 className="font-display text-4xl font-bold leading-[1.05] tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
                {hero.greeting}{" "}
                <span className="text-gradient">{hero.name}</span>
              </h1>
            </Reveal>

            <Reveal delay={0.1}>
              <Typewriter
                lines={hero.taglines}
                className="mt-6 min-h-[4.5rem] max-w-2xl font-display text-xl font-medium leading-snug text-foreground md:min-h-[5rem] md:text-2xl"
              />
              <p className="mt-4 max-w-2xl border-l-2 border-brand/60 pl-4 text-base text-muted-foreground md:text-lg">
                {hero.subheadline}
              </p>
            </Reveal>

            <Reveal delay={0.15}>
              <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center">
                <Button asChild size="lg">
                  <Link href={hero.primaryCta.href}>
                    {hero.primaryCta.label}
                    <ArrowRight className="size-4" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline">
                  <Link href={hero.secondaryCta.href}>
                    {hero.secondaryCta.label}
                  </Link>
                </Button>
              </div>
            </Reveal>
          </div>

          <Reveal delay={0.2} className="order-first lg:order-none">
            <HeroPortrait
              src={hero.photoSrc}
              alt={hero.photoAlt}
              orbit={hero.orbit}
              badges={hero.portraitBadges}
            />
          </Reveal>
        </div>
      </div>

      {/* Scroll cue */}
      <Link
        href="#about"
        aria-label="Scroll to about"
        className="absolute bottom-8 left-1/2 hidden -translate-x-1/2 text-muted-foreground transition-colors hover:text-foreground md:block"
      >
        <ArrowDown className="size-6 animate-bounce" />
      </Link>
    </section>
  );
}
