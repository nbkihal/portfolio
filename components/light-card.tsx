"use client";

import * as React from "react";
import {
  motion,
  useReducedMotion,
  useSpring,
  type HTMLMotionProps,
} from "framer-motion";

import { cn } from "@/lib/utils";

interface LightCardProps extends Omit<HTMLMotionProps<"div">, "children"> {
  children?: React.ReactNode;
  /** Max tilt toward the pointer, in degrees. 0 disables the tilt. */
  tilt?: number;
  /** Rotating beam of light travelling around the card's edge. */
  beam?: boolean;
  /** Diagonal shine that sweeps across on hover. */
  shine?: boolean;
}

/**
 * Card lit by the pointer: a spotlight on the surface, a border that glows
 * where the pointer is, a subtle 3D tilt and an optional rotating beam.
 * Light layers sit behind the content (the card is its own stacking
 * context), so children need no special wrapping.
 */
export function LightCard({
  tilt = 5,
  beam = false,
  shine = true,
  className,
  style,
  children,
  onPointerMove,
  onPointerLeave,
  ...props
}: LightCardProps) {
  const reduceMotion = useReducedMotion();
  const ref = React.useRef<HTMLDivElement>(null);
  const rotateX = useSpring(0, { stiffness: 180, damping: 18 });
  const rotateY = useSpring(0, { stiffness: 180, damping: 18 });

  // Feed the pointer position to the light layers via CSS variables
  // (no re-render) and tilt the card toward the pointer.
  const handleMove = (e: React.PointerEvent<HTMLDivElement>) => {
    onPointerMove?.(e);
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const px = e.clientX - rect.left;
    const py = e.clientY - rect.top;
    el.style.setProperty("--mx", `${px}px`);
    el.style.setProperty("--my", `${py}px`);

    if (!tilt || reduceMotion || e.pointerType !== "mouse") return;
    rotateY.set((px / rect.width - 0.5) * tilt * 2);
    rotateX.set(-(py / rect.height - 0.5) * tilt * 2);
  };

  const handleLeave = (e: React.PointerEvent<HTMLDivElement>) => {
    onPointerLeave?.(e);
    rotateX.set(0);
    rotateY.set(0);
  };

  return (
    <motion.div
      ref={ref}
      onPointerMove={handleMove}
      onPointerLeave={handleLeave}
      style={{ rotateX, rotateY, transformPerspective: 1000, ...style }}
      className={cn(
        "group group/light relative isolate overflow-hidden rounded-xl border bg-card text-card-foreground transition-shadow duration-500 [--mx:50%] [--my:0%] hover:shadow-[0_0_60px_-12px_hsl(var(--brand)/0.55)]",
        className,
      )}
      {...props}
    >
      {beam ? (
        <span
          aria-hidden
          className="border-mask animate-border-spin pointer-events-none absolute inset-0 -z-10 rounded-[inherit] opacity-60 transition-opacity duration-500 group-hover/light:opacity-100"
          style={{
            background:
              "conic-gradient(from var(--border-angle), transparent 55%, hsl(var(--brand)) 75%, hsl(var(--cyan)) 88%, transparent)",
          }}
        />
      ) : null}

      {/* Border that lights up under the pointer */}
      <span
        aria-hidden
        className="border-mask pointer-events-none absolute inset-0 -z-10 rounded-[inherit] opacity-0 transition-opacity duration-300 group-hover/light:opacity-100"
        style={{
          background:
            "radial-gradient(260px circle at var(--mx) var(--my), hsl(var(--brand)), hsl(var(--cyan) / 0.6) 40%, transparent 70%)",
        }}
      />

      {/* Spotlight on the card surface */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 opacity-0 transition-opacity duration-300 group-hover/light:opacity-100"
        style={{
          background:
            "radial-gradient(420px circle at var(--mx) var(--my), hsl(var(--brand) / 0.16), hsl(var(--cyan) / 0.05) 40%, transparent 65%)",
        }}
      />

      {shine ? (
        <span
          aria-hidden
          className="pointer-events-none absolute inset-y-0 -left-1/2 -z-10 w-1/3 -translate-x-full -skew-x-12 bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-1000 ease-out group-hover/light:translate-x-[550%]"
        />
      ) : null}

      {children}
    </motion.div>
  );
}
