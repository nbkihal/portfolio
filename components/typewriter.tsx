"use client";

import * as React from "react";
import { useReducedMotion } from "framer-motion";

import { cn } from "@/lib/utils";

const TYPE_MS = 38;
const DELETE_MS = 18;
const HOLD_MS = 2200;

/**
 * Types each line, holds it, deletes it, then moves to the next — on a
 * loop. Screen readers get the first line as plain text; the reduced-motion
 * fallback shows it statically.
 */
export function Typewriter({
  lines,
  className,
}: {
  lines: string[];
  className?: string;
}) {
  const reduceMotion = useReducedMotion();
  const [lineIndex, setLineIndex] = React.useState(0);
  const [length, setLength] = React.useState(0);
  const [deleting, setDeleting] = React.useState(false);

  const line = lines[lineIndex] ?? "";

  React.useEffect(() => {
    if (reduceMotion) return;
    let delay = deleting ? DELETE_MS : TYPE_MS;
    if (!deleting && length === line.length) delay = HOLD_MS;

    const id = window.setTimeout(() => {
      if (!deleting && length === line.length) {
        setDeleting(true);
      } else if (deleting && length === 0) {
        setDeleting(false);
        setLineIndex((i) => (i + 1) % lines.length);
      } else {
        setLength((n) => n + (deleting ? -1 : 1));
      }
    }, delay);
    return () => window.clearTimeout(id);
  }, [deleting, length, line.length, lines.length, reduceMotion]);

  return (
    <p className={cn("relative", className)}>
      <span className="sr-only">{lines[0]}</span>
      <span aria-hidden>
        {reduceMotion ? lines[0] : line.slice(0, length)}
        <span className="ml-0.5 inline-block h-[1em] w-[3px] translate-y-[0.15em] animate-pulse rounded-full bg-gradient-to-b from-brand to-cyan shadow-[0_0_10px_hsl(var(--brand))]" />
      </span>
    </p>
  );
}
