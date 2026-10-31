"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { useReducedMotion } from "framer-motion";

const INTERACTIVE =
  "a, button, [role='button'], input, textarea, select, label, summary";

/** Radius of the whole body of light at rest, in px. */
const RADIUS = 150;
/** How heavily the body lags the pointer. Lower is heavier. */
const FOLLOW = 5;
/** Overlapping lobes that make up the body. More is softer and slower. */
const LOBES = 7;

/* Violet, cyan and blue, cycled through the lobes so the body shifts colour as it swirls. */
const TINTS_DARK = [
  [170, 140, 255],
  [80, 220, 245],
  [120, 150, 255],
];
const TINTS_LIGHT = [
  [124, 58, 237],
  [6, 182, 212],
  [59, 130, 246],
];

interface Lobe {
  x: number;
  y: number;
  /** easing toward its target; each lobe has its own, so they slosh */
  follow: number;
  phase: number;
  /** orbit speed, in radians per second; alternate lobes orbit backwards */
  speed: number;
  /** orbit radius as a fraction of RADIUS */
  orbit: number;
  /** lobe radius as a fraction of RADIUS */
  size: number;
}

/**
 * Cursor light: a big, soft body of light that drifts after the pointer
 * like a shadow, drawn behind the page. It is made of several lobes that
 * each lag the pointer differently and orbit its centre at their own pace,
 * so the body sloshes and keeps moving on its own when the mouse rests, and
 * stretches along the direction of a fast move. Additive in dark mode, a
 * pale tint in light mode. Mouse/trackpad only, and off for people who
 * prefer reduced motion.
 */
export function CursorLight() {
  const reduceMotion = useReducedMotion();
  const { resolvedTheme } = useTheme();
  const dark = resolvedTheme !== "light";
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const [enabled, setEnabled] = React.useState(false);

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
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const pointer = { x: -9999, y: -9999, inside: false, hover: false };
    const core = { x: -9999, y: -9999 };
    const prev = { x: -9999, y: -9999 };
    const velocity = { x: 0, y: 0 };
    const lobes: Lobe[] = Array.from({ length: LOBES }, (_, i) => ({
      x: -9999,
      y: -9999,
      follow: 3.2 + i * 0.9,
      phase: (i / LOBES) * Math.PI * 2,
      speed: (0.28 + i * 0.06) * (i % 2 ? -1 : 1),
      orbit: 0.18 + (i % 3) * 0.09,
      size: 0.72 + (i % 2) * 0.22,
    }));
    let presence = 0; // 0 → 1 while the pointer is on the page
    let energy = 0; // 0 → 1 while hovering something clickable
    let width = 0;
    let height = 0;
    let raf = 0;
    let last = performance.now();
    const start = last;

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      // The light is all soft gradients, so half resolution is plenty and
      // keeps a full-screen canvas cheap.
      const dpr = Math.min(window.devicePixelRatio || 1, 2) * 0.5;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const frame = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const t = (now - start) / 1000;

      // The body glides after the pointer, well behind it, like a shadow
      // that takes a moment to catch up.
      const k = 1 - Math.exp(-dt * FOLLOW);
      core.x += (pointer.x - core.x) * k;
      core.y += (pointer.y - core.y) * k;
      velocity.x = (core.x - prev.x) / Math.max(dt, 0.001);
      velocity.y = (core.y - prev.y) / Math.max(dt, 0.001);
      prev.x = core.x;
      prev.y = core.y;
      presence +=
        ((pointer.inside ? 1 : 0) - presence) * (1 - Math.exp(-dt * 7));
      energy += ((pointer.hover ? 1 : 0) - energy) * (1 - Math.exp(-dt * 6));

      // Breathes slowly at rest, swells over clickable things.
      const R = RADIUS * (1 + energy * 0.2) * (0.94 + 0.06 * Math.sin(t * 0.7));
      // Fast moves pull the lobes out along the direction of travel.
      const stretch = Math.min(1, Math.hypot(velocity.x, velocity.y) / 1400);

      ctx.clearRect(0, 0, width, height);
      ctx.globalCompositeOperation = dark ? "lighter" : "source-over";
      const tints = dark ? TINTS_DARK : TINTS_LIGHT;
      const alpha = (dark ? 0.11 : 0.055) * presence;

      lobes.forEach((lobe, i) => {
        const angle = lobe.phase + t * lobe.speed;
        // the orbit itself swells and shrinks, so the body never settles into a ring
        const orbit = R * lobe.orbit * (1 + 0.4 * Math.sin(t * 0.8 + i * 1.7));
        const tx =
          core.x + Math.cos(angle) * orbit + velocity.x * 0.09 * (i / LOBES);
        const ty =
          core.y + Math.sin(angle) * orbit + velocity.y * 0.09 * (i / LOBES);
        const kl = 1 - Math.exp(-dt * lobe.follow);
        lobe.x += (tx - lobe.x) * kl;
        lobe.y += (ty - lobe.y) * kl;

        const r =
          R * lobe.size * (1 + 0.1 * Math.sin(t * 1.3 + i)) * (1 + stretch * 0.25);
        const [cr, cg, cb] = tints[i % tints.length];
        const glow = ctx.createRadialGradient(lobe.x, lobe.y, 0, lobe.x, lobe.y, r);
        // holds its colour most of the way out, then drops off: a body, not a haze
        glow.addColorStop(0, `rgba(${cr},${cg},${cb},${alpha})`);
        glow.addColorStop(0.6, `rgba(${cr},${cg},${cb},${alpha * 0.8})`);
        glow.addColorStop(0.85, `rgba(${cr},${cg},${cb},${alpha * 0.25})`);
        glow.addColorStop(1, `rgba(${cr},${cg},${cb},0)`);
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(lobe.x, lobe.y, r, 0, Math.PI * 2);
        ctx.fill();
      });

      // A brighter heart, so the light reads as one body rather than a cloud.
      if (dark) {
        const heart = ctx.createRadialGradient(core.x, core.y, 0, core.x, core.y, R * 0.5);
        heart.addColorStop(0, `rgba(235,240,255,${0.09 * presence})`);
        heart.addColorStop(1, "rgba(235,240,255,0)");
        ctx.fillStyle = heart;
        ctx.beginPath();
        ctx.arc(core.x, core.y, R * 0.5, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalCompositeOperation = "source-over";

      if (!pointer.inside && presence < 0.01) {
        raf = 0;
        ctx.clearRect(0, 0, width, height);
        return;
      }
      raf = requestAnimationFrame(frame);
    };

    const wake = () => {
      if (raf) return;
      last = performance.now();
      raf = requestAnimationFrame(frame);
    };

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      if (!pointer.inside && presence < 0.01) {
        // first contact: appear in place instead of sliding in from a corner
        core.x = prev.x = e.clientX;
        core.y = prev.y = e.clientY;
        for (const lobe of lobes) {
          lobe.x = e.clientX;
          lobe.y = e.clientY;
        }
      }
      pointer.x = e.clientX;
      pointer.y = e.clientY;
      pointer.inside = true;
      wake();
    };
    const onOver = (e: PointerEvent) => {
      pointer.hover = Boolean(
        (e.target as Element | null)?.closest(INTERACTIVE),
      );
    };
    const onLeave = () => {
      pointer.inside = false;
      wake();
    };

    resize();
    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerover", onOver);
    document.documentElement.addEventListener("pointerleave", onLeave);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerover", onOver);
      document.documentElement.removeEventListener("pointerleave", onLeave);
    };
  }, [enabled, dark]);

  if (!enabled) return null;

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 h-full w-full"
    />
  );
}
