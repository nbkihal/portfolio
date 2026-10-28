"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { useReducedMotion } from "framer-motion";

const INTERACTIVE =
  "a, button, [role='button'], input, textarea, select, label, summary";

/** How long a point of the trail stays visible — the "slow motion". */
const TRAIL_MS = 750;
/** Head easing toward the pointer (higher = snappier, lower = heavier). */
const FOLLOW = 16;

interface TrailPoint {
  x: number;
  y: number;
  t: number;
}

/*
 * Glow layers for the blade, drawn wide → narrow. Each is a stroke along
 * the trail; stacked, they read as one beam with a white-hot core.
 * [width multiplier, colour (dark theme), colour (light theme)]
 */
const LAYERS: Array<[number, string, string]> = [
  [9, "rgba(255,40,40,0.05)", "rgba(220,38,38,0.05)"],
  [5, "rgba(255,50,50,0.10)", "rgba(220,38,38,0.09)"],
  [2.6, "rgba(255,70,60,0.28)", "rgba(220,38,38,0.22)"],
  [1.4, "rgba(255,120,110,0.6)", "rgba(200,30,30,0.55)"],
  [0.55, "rgba(255,240,236,0.95)", "rgba(127,29,29,0.9)"],
];

/**
 * Light-blade cursor: the pointer drags a glowing red blade of light that
 * fades slowly, like a slow-motion swing — white-hot core, layered glow,
 * tapering toward the tail. Brightens over interactive elements; a click
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
      const base = 6 + energy * 2.5;
      if (trail.length > 1) {
        for (const [mult, darkColor, lightColor] of LAYERS) {
          ctx.strokeStyle = dark ? darkColor : lightColor;
          for (let i = 1; i < trail.length; i++) {
            const a = trail[i - 1];
            const b = trail[i];
            const c = trail[i + 1] ?? b;
            const life = 1 - (now - b.t) / TRAIL_MS;
            if (life <= 0) continue;
            ctx.lineWidth = Math.max(0.4, base * mult * Math.pow(life, 1.4));
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
          ? `rgba(255,80,70,${0.55 * (1 - p)})`
          : `rgba(200,30,30,${0.45 * (1 - p)})`;
        ctx.lineWidth = 2.5 * (1 - p) + 0.5;
        ctx.beginPath();
        ctx.arc(ring.x, ring.y, 6 + ease * 42, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Tip of the blade: a humming point of light.
      if (pointer.inside) {
        const hum = 1 + Math.sin(now / 140) * 0.08 + energy * 0.35;
        const r = 14 * hum;
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
          dark ? "rgba(255,235,230,0.85)" : "rgba(185,28,28,0.7)",
        );
        glow.addColorStop(
          0.3,
          dark ? "rgba(255,60,50,0.35)" : "rgba(220,38,38,0.25)",
        );
        glow.addColorStop(1, "rgba(255,30,30,0)");
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(head.x, head.y, r, 0, Math.PI * 2);
        ctx.fill();
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
        head.x = e.clientX;
        head.y = e.clientY;
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
