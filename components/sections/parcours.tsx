"use client";

import * as React from "react";
import Link from "next/link";
import {
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from "framer-motion";
import { ArrowRight } from "lucide-react";

import { parcours, type Milestone } from "@/content/site-data";
import { icons } from "@/lib/icons";
import { cn } from "@/lib/utils";
import { Section, SectionHeading } from "@/components/section";
import { LightCard } from "@/components/light-card";

/**
 * Scroll-driven roadmap. The line fills and a light travels down it as you
 * scroll; each stop lights up when it reaches the middle of the screen and
 * dims again when you scroll back past it.
 */
export function Parcours() {
  const listRef = React.useRef<HTMLOListElement>(null);
  const [active, setActive] = React.useState(0);
  const { scrollYProgress } = useScroll({
    target: listRef,
    offset: ["start 60%", "end 60%"],
  });
  const progress = useSpring(scrollYProgress, {
    stiffness: 140,
    damping: 26,
    restDelta: 0.001,
  });
  const cometTop = useTransform(progress, (v) => `${v * 100}%`);

  useMotionValueEvent(scrollYProgress, "change", (v) => {
    const last = parcours.length - 1;
    setActive(Math.min(last, Math.max(0, Math.round(v * last))));
  });

  return (
    <Section id="parcours" className="relative">
      <div className="container">
        <SectionHeading
          eyebrow="Parcours"
          title="The road so far"
          description="From the first day at ESI to client work and club leadership — scroll to travel the roadmap, and back up to rewind it."
        />

        <div className="relative">
          {/* Track, fill and travelling light */}
          <div
            aria-hidden
            className="absolute bottom-0 left-5 top-0 w-px -translate-x-1/2 bg-border md:left-1/2"
          >
            <motion.div
              className="absolute inset-0 origin-top bg-gradient-to-b from-brand via-brand to-cyan shadow-[0_0_12px_hsl(var(--brand))]"
              style={{ scaleY: progress }}
            />
            <motion.div
              className="absolute left-1/2 size-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white shadow-[0_0_10px_3px_hsl(var(--brand)),0_0_30px_10px_hsl(var(--cyan)/0.5)]"
              style={{ top: cometTop }}
            />
          </div>

          <ol ref={listRef} className="relative flex flex-col gap-12 md:gap-20">
            {parcours.map((milestone, i) => (
              <MilestoneRow
                key={`${milestone.title}-${i}`}
                milestone={milestone}
                index={i}
                last={i === parcours.length - 1}
              />
            ))}
          </ol>

          {/* Sticky "you are here" readout */}
          <div className="pointer-events-none sticky bottom-6 z-20 mt-12 flex justify-center">
            <div className="inline-flex items-center gap-3 rounded-full border bg-background/80 px-4 py-2 text-sm shadow-lg backdrop-blur-md">
              <span className="font-display font-bold tabular-nums text-brand">
                {String(active + 1).padStart(2, "0")}
                <span className="text-muted-foreground">
                  {" "}
                  / {String(parcours.length).padStart(2, "0")}
                </span>
              </span>
              <span className="h-4 w-px bg-border" />
              <span className="max-w-[12rem] truncate text-muted-foreground">
                {parcours[active].title}
              </span>
            </div>
          </div>
        </div>
      </div>
    </Section>
  );
}

function MilestoneRow({
  milestone,
  index,
  last,
}: {
  milestone: Milestone;
  index: number;
  last: boolean;
}) {
  const ref = React.useRef<HTMLLIElement>(null);
  const reduceMotion = useReducedMotion();
  const left = index % 2 === 0;
  // 0 → 1 as this stop travels from the lower part of the screen to the middle.
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 85%", "start 50%"],
  });
  const p = useSpring(scrollYProgress, { stiffness: 160, damping: 26 });

  const cardOpacity = useTransform(p, [0, 1], [0.25, 1]);
  const cardX = useTransform(
    p,
    [0, 1],
    [reduceMotion ? 0 : left ? -48 : 48, 0],
  );
  const cardScale = useTransform(p, [0, 1], [reduceMotion ? 1 : 0.94, 1]);
  const Icon = icons[milestone.icon];

  return (
    <li
      ref={ref}
      className="relative grid grid-cols-[2.5rem_1fr] gap-x-5 md:grid-cols-[1fr_3.5rem_1fr] md:gap-x-10"
    >
      <Node progress={p} className="md:col-start-2 md:row-start-1">
        <Icon className="size-4 md:size-5" />
      </Node>

      {/* Big period label on the opposite side (desktop) */}
      <PeriodLabel
        progress={p}
        period={milestone.period}
        className={cn(
          "hidden self-center md:row-start-1 md:block",
          left ? "md:col-start-3 md:text-left" : "md:col-start-1 md:text-right",
        )}
      />

      <motion.div
        style={{ opacity: cardOpacity, x: cardX, scale: cardScale }}
        className={cn(
          "md:row-start-1",
          left ? "md:col-start-1" : "md:col-start-3",
        )}
      >
        <LightCard
          tilt={4}
          beam={last}
          className={cn("p-6", left && "md:text-right")}
        >
          <div
            className={cn(
              "mb-2 flex flex-wrap items-center gap-2 text-xs font-medium uppercase tracking-widest text-brand",
              left && "md:justify-end",
            )}
          >
            <span className="md:hidden">{milestone.period} ·</span>
            {milestone.place}
          </div>
          <h3 className="font-display text-xl font-bold leading-tight md:text-2xl">
            {milestone.title}
          </h3>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground md:text-base">
            {milestone.description}
          </p>

          {milestone.tags?.length ? (
            <ul
              className={cn(
                "mt-4 flex flex-wrap gap-2",
                left && "md:justify-end",
              )}
            >
              {milestone.tags.map((tag) => (
                <li
                  key={tag}
                  className="rounded-full border border-brand/30 bg-brand/10 px-2.5 py-0.5 text-xs text-brand"
                >
                  {tag}
                </li>
              ))}
            </ul>
          ) : null}

          {last ? (
            <Link
              href="/#contact"
              className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-brand transition-colors hover:text-foreground"
            >
              Start the conversation
              <ArrowRight className="size-4" />
            </Link>
          ) : null}
        </LightCard>
      </motion.div>
    </li>
  );
}

/** Roadmap node that ignites as its stop scrolls into place. */
function Node({
  progress,
  className,
  children,
}: {
  progress: MotionValue<number>;
  className?: string;
  children: React.ReactNode;
}) {
  const glow = useTransform(progress, [0.4, 1], [0, 1]);
  const scale = useTransform(progress, [0, 1], [0.85, 1.1]);

  return (
    <motion.div
      style={{ scale }}
      className={cn(
        "relative z-10 flex size-10 items-center justify-center self-start rounded-full border bg-background text-muted-foreground md:size-14 md:self-center",
        className,
      )}
    >
      <motion.span
        aria-hidden
        style={{ opacity: glow }}
        className="absolute -inset-px rounded-full bg-gradient-to-br from-brand to-cyan shadow-[0_0_24px_4px_hsl(var(--brand)/0.6)]"
      />
      <motion.span
        aria-hidden
        style={{ opacity: glow }}
        className="absolute -inset-3 rounded-full bg-brand/25 blur-xl"
      />
      <span className="relative text-foreground">{children}</span>
    </motion.div>
  );
}

function PeriodLabel({
  progress,
  period,
  className,
}: {
  progress: MotionValue<number>;
  period: string;
  className?: string;
}) {
  const lit = useTransform(progress, [0.3, 1], [0, 1]);

  return (
    <div className={cn("relative", className)} aria-hidden>
      <span className="font-display text-5xl font-bold tracking-tight text-foreground/[0.06] lg:text-6xl">
        {period}
      </span>
      <motion.span
        style={{ opacity: lit }}
        className={cn(
          "text-gradient absolute inset-0 font-display text-5xl font-bold tracking-tight drop-shadow-[0_0_24px_hsl(var(--brand)/0.5)] lg:text-6xl",
        )}
      >
        {period}
      </motion.span>
    </div>
  );
}
