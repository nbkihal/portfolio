import Link from "next/link";
import Image from "next/image";
import { ArrowRight, ArrowDown } from "lucide-react";

import { hero } from "@/content/site-data";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/reveal";
import { HeroGlobe } from "@/components/hero-globe";

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
              <p className="mt-6 max-w-2xl text-lg text-muted-foreground md:text-xl">
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
            <div className="relative mx-auto aspect-square w-full max-w-xs sm:max-w-sm lg:ml-auto lg:max-w-md">
              {/* Soft brand halo to lift the portrait off the globe */}
              <div
                aria-hidden="true"
                className="absolute -inset-4 -z-10 rounded-[2rem] bg-brand/20 blur-2xl"
              />
              <div className="relative h-full w-full overflow-hidden rounded-full border border-border bg-card shadow-2xl glow-brand">
                <Image
                  src={hero.photoSrc}
                  alt={hero.photoAlt}
                  fill
                  priority
                  sizes="(min-width: 1024px) 28rem, (min-width: 640px) 24rem, 80vw"
                  className="object-cover"
                />
              </div>
            </div>
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
