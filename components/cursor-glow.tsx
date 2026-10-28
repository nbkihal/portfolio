"use client";

import * as React from "react";
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
} from "framer-motion";

const INTERACTIVE =
  "a, button, [role='button'], input, textarea, select, label, summary";

/**
 * Glowing custom cursor: a bright core dot, a trailing ring, and a soft
 * brand-colored light that follows the pointer. Grows over interactive
 * elements and pulses on click. Only enabled on mouse/trackpad devices
 * and skipped entirely when the user prefers reduced motion.
 */
export function CursorGlow() {
  const reduceMotion = useReducedMotion();
  const [enabled, setEnabled] = React.useState(false);
  const [visible, setVisible] = React.useState(false);
  const [hovering, setHovering] = React.useState(false);
  const [pressed, setPressed] = React.useState(false);

  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  // The ring and light trail behind the dot at different speeds.
  const ringX = useSpring(x, { stiffness: 350, damping: 28, mass: 0.5 });
  const ringY = useSpring(y, { stiffness: 350, damping: 28, mass: 0.5 });
  const lightX = useSpring(x, { stiffness: 120, damping: 20, mass: 0.8 });
  const lightY = useSpring(y, { stiffness: 120, damping: 20, mass: 0.8 });

  React.useEffect(() => {
    if (reduceMotion) return;
    const media = window.matchMedia("(hover: hover) and (pointer: fine)");
    const update = () => setEnabled(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, [reduceMotion]);

  React.useEffect(() => {
    if (!enabled) return;
    const root = document.documentElement;
    root.classList.add("has-custom-cursor");

    const onMove = (e: PointerEvent) => {
      x.set(e.clientX);
      y.set(e.clientY);
      setVisible(true);
    };
    const onOver = (e: PointerEvent) => {
      const target = e.target as Element | null;
      setHovering(Boolean(target?.closest(INTERACTIVE)));
    };
    const onDown = () => setPressed(true);
    const onUp = () => setPressed(false);
    const onLeave = () => setVisible(false);

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerover", onOver);
    window.addEventListener("pointerdown", onDown);
    window.addEventListener("pointerup", onUp);
    root.addEventListener("pointerleave", onLeave);
    return () => {
      root.classList.remove("has-custom-cursor");
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerover", onOver);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      root.removeEventListener("pointerleave", onLeave);
    };
  }, [enabled, x, y]);

  if (!enabled) return null;

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-[100] overflow-hidden"
      style={{ opacity: visible ? 1 : 0, transition: "opacity 200ms" }}
    >
      {/* Ambient light */}
      <motion.div
        className="absolute left-0 top-0 h-[420px] w-[420px] rounded-full opacity-40 blur-2xl dark:opacity-60 dark:mix-blend-screen"
        style={{
          x: lightX,
          y: lightY,
          translateX: "-50%",
          translateY: "-50%",
          background:
            "radial-gradient(circle, hsl(var(--brand) / 0.35) 0%, hsl(var(--cyan) / 0.12) 40%, transparent 70%)",
        }}
        animate={{ scale: hovering ? 1.25 : 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 20 }}
      />

      {/* Trailing ring */}
      <motion.div
        className="absolute left-0 top-0 rounded-full border border-brand/70"
        style={{
          x: ringX,
          y: ringY,
          translateX: "-50%",
          translateY: "-50%",
          boxShadow:
            "0 0 16px hsl(var(--brand) / 0.6), inset 0 0 10px hsl(var(--cyan) / 0.35)",
        }}
        animate={{
          width: hovering ? 52 : 34,
          height: hovering ? 52 : 34,
          scale: pressed ? 0.8 : 1,
          backgroundColor: hovering
            ? "hsl(var(--brand) / 0.12)"
            : "hsl(var(--brand) / 0)",
        }}
        transition={{ type: "spring", stiffness: 300, damping: 22 }}
      />

      {/* Core dot */}
      <motion.div
        className="absolute left-0 top-0 h-2 w-2 rounded-full bg-white"
        style={{
          x,
          y,
          translateX: "-50%",
          translateY: "-50%",
          boxShadow:
            "0 0 6px 2px hsl(var(--brand)), 0 0 18px 6px hsl(var(--brand) / 0.6), 0 0 32px 10px hsl(var(--cyan) / 0.35)",
        }}
        animate={{ scale: pressed ? 1.8 : hovering ? 0.5 : 1 }}
        transition={{ type: "spring", stiffness: 500, damping: 25 }}
      />
    </div>
  );
}
