"use client";

import * as React from "react";
import Image from "next/image";
import { motion, useReducedMotion, useSpring } from "framer-motion";

interface HeroPortraitProps {
  src: string;
  alt: string;
  /** Tech labels that orbit the portrait. */
  orbit: string[];
  badges: { top: string; bottom: string };
}

/**
 * Portrait wrapped in light: a rotating light ring, orbiting tech chips,
 * a glare that follows the pointer with a 3D tilt, a periodic scan line,
 * and two floating badges.
 */
export function HeroPortrait({ src, alt, orbit, badges }: HeroPortraitProps) {
  const reduceMotion = useReducedMotion();
  const ref = React.useRef<HTMLDivElement>(null);
  const rotateX = useSpring(0, { stiffness: 150, damping: 16 });
  const rotateY = useSpring(0, { stiffness: 150, damping: 16 });

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    el.style.setProperty("--gx", `${x * 100}%`);
    el.style.setProperty("--gy", `${y * 100}%`);
    if (reduceMotion || e.pointerType !== "mouse") return;
    rotateY.set((x - 0.5) * 18);
    rotateX.set(-(y - 0.5) * 18);
  };

  const onPointerLeave = () => {
    rotateX.set(0);
    rotateY.set(0);
  };

  return (
    <div
      ref={ref}
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
      className="group relative mx-auto aspect-square w-full max-w-xs [--gx:50%] [--gy:30%] sm:max-w-sm lg:ml-auto lg:max-w-md"
    >
      {/* Soft brand halo */}
      <div
        aria-hidden
        className="absolute inset-[8%] -z-10 rounded-full bg-brand/30 blur-3xl transition-opacity duration-500 group-hover:opacity-100 md:opacity-70"
      />

      {/* Dashed orbit with a light travelling on it */}
      <div
        aria-hidden
        className="absolute inset-[3%] animate-[spin_14s_linear_infinite] rounded-full border border-dashed border-brand/25"
      >
        <span className="absolute left-1/2 top-0 size-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white shadow-[0_0_8px_3px_hsl(var(--brand)),0_0_20px_8px_hsl(var(--cyan)/0.5)]" />
      </div>

      {/* Orbiting tech chips (each counter-spins to stay upright) */}
      <div
        aria-hidden
        className="absolute -inset-[4%] animate-[spin_40s_linear_infinite]"
      >
        {orbit.map((label, i) => {
          const angle = (i / orbit.length) * Math.PI * 2 - Math.PI / 2;
          return (
            <span
              key={label}
              className="absolute"
              style={{
                left: `${50 + 50 * Math.cos(angle)}%`,
                top: `${50 + 50 * Math.sin(angle)}%`,
              }}
            >
              <span className="block -translate-x-1/2 -translate-y-1/2">
                <span className="flex animate-[spin_40s_linear_infinite_reverse] items-center gap-1.5 whitespace-nowrap rounded-full border border-border bg-background/75 px-2.5 py-1 text-[11px] font-medium text-foreground/90 shadow-sm backdrop-blur-md sm:text-xs">
                  <span className="size-1.5 rounded-full bg-cyan shadow-[0_0_6px_1px_hsl(var(--cyan))]" />
                  {label}
                </span>
              </span>
            </span>
          );
        })}
      </div>

      {/* Tilting portrait */}
      <motion.div
        style={{ rotateX, rotateY, transformPerspective: 900 }}
        className="absolute inset-[14%]"
      >
        {/* Rotating light ring */}
        <div
          aria-hidden
          className="animate-border-spin absolute -inset-[3px] rounded-full blur-[1px]"
          style={{
            background:
              "conic-gradient(from var(--border-angle), hsl(var(--brand)), hsl(var(--cyan)), transparent 40%, transparent 60%, hsl(var(--brand)))",
          }}
        />
        <div
          aria-hidden
          className="animate-border-spin absolute -inset-3 rounded-full opacity-60 blur-xl"
          style={{
            background:
              "conic-gradient(from var(--border-angle), hsl(var(--brand) / 0.8), hsl(var(--cyan) / 0.6), transparent 40%, transparent 60%, hsl(var(--brand) / 0.8))",
          }}
        />

        <div className="relative h-full w-full overflow-hidden rounded-full bg-card shadow-2xl">
          <Image
            src={src}
            alt={alt}
            fill
            priority
            sizes="(min-width: 1024px) 22rem, (min-width: 640px) 18rem, 60vw"
            className="object-cover transition-transform duration-700 group-hover:scale-105"
          />
          {/* Glare following the pointer */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-0 mix-blend-soft-light transition-opacity duration-300 group-hover:opacity-100"
            style={{
              background:
                "radial-gradient(circle at var(--gx) var(--gy), rgba(255,255,255,0.7), transparent 55%)",
            }}
          />
          {/* Brand tint at the bottom edge */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-gradient-to-t from-brand/30 via-transparent to-transparent"
          />
          {/* Scan line */}
          <div
            aria-hidden
            className="animate-scan pointer-events-none absolute inset-x-0 top-0 h-1/4 bg-gradient-to-b from-transparent via-cyan/25 to-transparent"
          />
        </div>
      </motion.div>

      {/* Floating badges */}
      <motion.div
        animate={reduceMotion ? undefined : { y: [0, -8, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        className="absolute right-0 top-[12%] z-10 rounded-xl border bg-background/80 px-3 py-2 text-xs font-medium shadow-lg backdrop-blur-md sm:-right-2"
      >
        {badges.top}
      </motion.div>
      <motion.div
        animate={reduceMotion ? undefined : { y: [0, 8, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-[12%] left-0 z-10 inline-flex items-center gap-2 rounded-xl border bg-background/80 px-3 py-2 text-xs font-medium shadow-lg backdrop-blur-md sm:-left-2"
      >
        <span className="relative flex size-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex size-2 rounded-full bg-emerald-400" />
        </span>
        {badges.bottom}
      </motion.div>
    </div>
  );
}
