"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { useReducedMotion } from "framer-motion";

const INTERACTIVE =
  "a, button, [role='button'], input, textarea, select, label, summary";

/** How long a point of the trail stays visible — the "slow motion". */
const TRAIL_MS = 320;
/** Head easing toward the pointer (higher = snappier, lower = heavier). */
const FOLLOW = 34;

interface TrailPoint {
  x: number;
  y: number;
  t: number;
}

/*
 * Colour gradient along the blade, from the fresh tip to the fading tail:
 * pale ice blue → sky blue → blue → indigo.
 */
const RAMP_DARK = [
  [200, 238, 255],
  [125, 211, 252],
  [56, 189, 248],
  [59, 130, 246],
  [99, 102, 241],
];
const RAMP_LIGHT = [
  [14, 165, 233],
  [2, 132, 199],
  [3, 105, 161],
  [37, 99, 235],
  [79, 70, 229],
];

/*
 * Glow layers, drawn wide → narrow; stacked, they read as one beam.
 * [width multiplier, opacity (dark theme), opacity (light theme), core?]
 */
const LAYERS: Array<[number, number, number, boolean]> = [
  [9, 0.05, 0.05, false],
  [5, 0.1, 0.09, false],
  [2.6, 0.28, 0.22, false],
  [1.4, 0.6, 0.5, false],
  [0.55, 0.95, 0.85, true],
];

function shade(ramp: number[][], t: number) {
  const f = Math.min(0.999, Math.max(0, t)) * (ramp.length - 1);
  const i = Math.floor(f);
  const k = f - i;
  return ramp[i].map((v, c) => v + (ramp[i + 1][c] - v) * k);
}

/**
 * Light-blade cursor: the pointer drags a glowing light-blue blade that
 * fades slowly, like a slow-motion swing — near-white core, layered glow,
 * shading from ice blue to indigo as it tapers toward the tail. Brightens over interactive elements; a click
 * sends out a slow light ring. Mouse/trackpad only, and off for people who
 * prefer reduced motion.
 */
export function LightBladeCursor() {
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

    const root = document.documentElement;
    root.classList.add("has-custom-cursor");

    const trail: TrailPoint[] = [];
    const rings: Array<{ x: number; y: number; t: number }> = [];
    const pointer = { x: -100, y: -100, inside: false, hover: false };
    const head = { x: -100, y: -100 };
    const prevHead = { x: -100, y: -100 };
    let motion = 0;
    let width = 0;
    let height = 0;
    let raf = 0;
    let last = performance.now();
    let energy = 0; // 0 → 1 while hovering something clickable

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const frame = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;

      // The head glides after the pointer — this lag is what makes the
      // swing feel heavy and slowed down.
      const k = 1 - Math.exp(-dt * FOLLOW);
      head.x += (pointer.x - head.x) * k;
      head.y += (pointer.y - head.y) * k;
      energy += ((pointer.hover ? 1 : 0) - energy) * (1 - Math.exp(-dt * 10));
      // 0 at rest → 1 when moving fast; shrinks and dims the tip in motion.
      const speed =
        Math.hypot(head.x - prevHead.x, head.y - prevHead.y) /
        Math.max(dt, 0.001);
      prevHead.x = head.x;
      prevHead.y = head.y;
      motion += (Math.min(1, speed / 700) - motion) * (1 - Math.exp(-dt * 12));

      if (pointer.inside) {
        const prev = trail[trail.length - 1];
        if (!prev || Math.hypot(head.x - prev.x, head.y - prev.y) > 0.6) {
          trail.push({ x: head.x, y: head.y, t: now });
        }
      }
      while (trail.length && now - trail[0].t > TRAIL_MS) trail.shift();
      while (rings.length && now - rings[0].t > 900) rings.shift();

      ctx.clearRect(0, 0, width, height);
      ctx.globalCompositeOperation = dark ? "lighter" : "source-over";
      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      // Blade: each glow layer is stroked segment by segment so its width
      // can taper with the age of the trail.
      const base = (4.5 + energy * 2) * (1 - motion * 0.3);
      if (trail.length > 1) {
        const ramp = dark ? RAMP_DARK : RAMP_LIGHT;
        for (const [mult, darkAlpha, lightAlpha, core] of LAYERS) {
          const alpha = dark ? darkAlpha : lightAlpha;
          for (let i = 1; i < trail.length; i++) {
            const a = trail[i - 1];
            const b = trail[i];
            const c = trail[i + 1] ?? b;
            const life = 1 - (now - b.t) / TRAIL_MS;
            if (life <= 0) continue;
            let [r, g, bl] = shade(ramp, 1 - life);
            if (core && dark) {
              // The core stays almost white near the tip.
              const w = 0.75 * life;
              r += (255 - r) * w;
              g += (255 - g) * w;
              bl += (255 - bl) * w;
            }
            ctx.strokeStyle = `rgba(${r | 0},${g | 0},${bl | 0},${alpha})`;
            ctx.lineWidth = Math.max(0.4, base * mult * Math.pow(life, 0.85));
            ctx.beginPath();
            ctx.moveTo((a.x + b.x) / 2, (a.y + b.y) / 2);
            ctx.quadraticCurveTo(b.x, b.y, (b.x + c.x) / 2, (b.y + c.y) / 2);
            ctx.stroke();
          }
        }
      }

      // Click rings: slow, soft shockwaves.
      for (const ring of rings) {
        const p = (now - ring.t) / 900;
        const ease = 1 - Math.pow(1 - p, 3);
        ctx.strokeStyle = dark
          ? `rgba(125,211,252,${0.55 * (1 - p)})`
          : `rgba(2,132,199,${0.45 * (1 - p)})`;
        ctx.lineWidth = 2.5 * (1 - p) + 0.5;
        ctx.beginPath();
        ctx.arc(ring.x, ring.y, 6 + ease * 42, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Tip of the blade: a humming point of light.
      if (pointer.inside) {
        const hum = 1 + Math.sin(now / 140) * 0.08 + energy * 0.35;
        const r = 8 * hum * (1 - motion * 0.45);
        ctx.globalAlpha = 1 - motion * 0.55;
        const glow = ctx.createRadialGradient(
          head.x,
          head.y,
          0,
          head.x,
          head.y,
          r,
        );
        glow.addColorStop(
          0,
          dark ? "rgba(230,247,255,0.85)" : "rgba(2,132,199,0.7)",
        );
        glow.addColorStop(
          0.3,
          dark ? "rgba(56,189,248,0.35)" : "rgba(14,165,233,0.25)",
        );
        glow.addColorStop(1, "rgba(59,130,246,0)");
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(head.x, head.y, r, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
      }
      ctx.globalCompositeOperation = "source-over";

      if (!pointer.inside && trail.length === 0 && rings.length === 0) {
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
      if (!pointer.inside) {
        head.x = prevHead.x = e.clientX;
        head.y = prevHead.y = e.clientY;
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
    const onDown = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      rings.push({ x: e.clientX, y: e.clientY, t: performance.now() });
      wake();
    };
    const onLeave = () => {
      pointer.inside = false;
    };

    resize();
    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerover", onOver);
    window.addEventListener("pointerdown", onDown);
    root.addEventListener("pointerleave", onLeave);

    return () => {
      cancelAnimationFrame(raf);
      root.classList.remove("has-custom-cursor");
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerover", onOver);
      window.removeEventListener("pointerdown", onDown);
      root.removeEventListener("pointerleave", onLeave);
    };
  }, [enabled, dark]);

  if (!enabled) return null;

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className="pointer-events-none fixed inset-0 z-[100] h-full w-full"
    />
  );
}
