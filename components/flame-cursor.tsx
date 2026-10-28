"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { useReducedMotion } from "framer-motion";

const INTERACTIVE =
  "a, button, [role='button'], input, textarea, select, label, summary";

/** Hard cap on live particles, to keep every frame cheap. */
const MAX_PARTICLES = 600;
const STEPS = 24;

/*
 * Flame temperature ramp, hottest first. Each particle walks down this
 * ramp over its life: white-hot core → ice cyan → blue → violet → gone.
 */
const RAMP_DARK = [
  [240, 252, 255],
  [170, 240, 255],
  [64, 220, 245],
  [34, 160, 240],
  [70, 100, 240],
  [124, 80, 235],
  [90, 50, 170],
];
const RAMP_LIGHT = [
  [14, 165, 233],
  [8, 145, 178],
  [14, 116, 200],
  [37, 99, 235],
  [79, 70, 229],
  [109, 40, 217],
  [76, 29, 149],
];

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  age: number;
  life: number;
  size: number;
  seed: number;
  ember: boolean;
}

function lerpRamp(ramp: number[][], t: number) {
  const f = Math.min(0.999, Math.max(0, t)) * (ramp.length - 1);
  const i = Math.floor(f);
  const k = f - i;
  return ramp[i].map((v, c) => Math.round(v + (ramp[i + 1][c] - v) * k));
}

/** One soft radial sprite per temperature step (drawn once, reused). */
function makeSprites(ramp: number[][], dark: boolean) {
  return Array.from({ length: STEPS }, (_, i) => {
    const [r, g, b] = lerpRamp(ramp, i / (STEPS - 1));
    const c = document.createElement("canvas");
    c.width = c.height = 64;
    const ctx = c.getContext("2d")!;
    const grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    grad.addColorStop(0, `rgba(${r},${g},${b},${dark ? 0.9 : 0.5})`);
    grad.addColorStop(0.3, `rgba(${r},${g},${b},${dark ? 0.45 : 0.32})`);
    grad.addColorStop(0.65, `rgba(${r},${g},${b},${dark ? 0.12 : 0.12})`);
    grad.addColorStop(1, `rgba(${r},${g},${b},0)`);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 64, 64);
    return c;
  });
}

/** Cheap, smooth pseudo-noise for turbulence (no lookup tables). */
function turbulence(x: number, y: number, t: number) {
  return (
    Math.sin(x * 0.045 + t * 3.1) * Math.cos(y * 0.038 - t * 2.4) +
    Math.sin((x - y) * 0.021 + t * 5.3) * 0.55 +
    Math.sin(y * 0.09 + t * 7.7) * 0.25
  );
}

/**
 * Cold-fire cursor: a particle flame that burns at the pointer — white-hot
 * at the base, ice-blue in the body, violet at the tips — with flicker,
 * turbulence, drift away from the direction of motion, and rising embers.
 * Flares over links and buttons; a click throws a burst of sparks. A
 * bright core marks the exact click point. Mouse/trackpad only, and off
 * for people who prefer reduced motion.
 */
export function FlameCursor() {
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

    const ramp = dark ? RAMP_DARK : RAMP_LIGHT;
    const sprites = makeSprites(ramp, dark);
    const particles: Particle[] = [];
    const pointer = {
      x: -100,
      y: -100,
      vx: 0,
      vy: 0,
      inside: false,
      hover: false,
      down: false,
    };
    let lastX = -100;
    let lastY = -100;
    let width = 0;
    let height = 0;
    let raf = 0;
    let last = performance.now();
    let time = 0;
    let carry = 0;
    let flare = 0;

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const spawn = (opts: Partial<Particle> & { ember?: boolean }) => {
      if (particles.length >= MAX_PARTICLES) particles.shift();
      const ember = opts.ember ?? false;
      particles.push({
        x: pointer.x + (Math.random() - 0.5) * 6,
        y: pointer.y + (Math.random() - 0.5) * 4,
        vx: 0,
        vy: 0,
        age: 0,
        life: ember ? 0.9 + Math.random() * 1.1 : 0.45 + Math.random() * 0.5,
        size: ember ? 1.6 + Math.random() * 2 : 12 + Math.random() * 12,
        seed: Math.random() * 1000,
        ember,
        ...opts,
      });
    };

    const sparkBurst = (count: number) => {
      for (let i = 0; i < count; i++) {
        const a = Math.random() * Math.PI * 2;
        const v = 120 + Math.random() * 320;
        spawn({
          ember: true,
          vx: Math.cos(a) * v,
          vy: Math.sin(a) * v - 120,
          life: 0.5 + Math.random() * 0.7,
        });
      }
    };

    const frame = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      time += dt;

      // Pointer velocity, smoothed so the lean doesn't jitter.
      const ivx = (pointer.x - lastX) / Math.max(dt, 0.001);
      const ivy = (pointer.y - lastY) / Math.max(dt, 0.001);
      lastX = pointer.x;
      lastY = pointer.y;
      pointer.vx += (ivx - pointer.vx) * 0.25;
      pointer.vy += (ivy - pointer.vy) * 0.25;
      const speed = Math.hypot(pointer.vx, pointer.vy);
      flare += ((pointer.hover ? 1 : 0) - flare) * 0.12;

      // Emit: a steady idle burn, more while moving, more on hover.
      if (pointer.inside) {
        carry += dt * (190 + Math.min(speed, 2400) * 0.22) * (1 + flare * 0.5);
        while (carry >= 1) {
          carry -= 1;
          const along = Math.random();
          spawn({
            // Fill the gap between frames when moving fast.
            x: pointer.x - pointer.vx * dt * along + (Math.random() - 0.5) * 7,
            y: pointer.y - pointer.vy * dt * along + (Math.random() - 0.5) * 4,
            vx: -pointer.vx * 0.12 + (Math.random() - 0.5) * 40,
            vy: -90 - Math.random() * 120 - pointer.vy * 0.08,
            size: (12 + Math.random() * 12) * (1 + flare * 0.22),
          });
          if (Math.random() < 0.035 + flare * 0.05) {
            spawn({
              ember: true,
              vx: (Math.random() - 0.5) * 60 - pointer.vx * 0.05,
              vy: -90 - Math.random() * 140,
            });
          }
        }
      }

      // Simulate
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.age += dt;
        if (p.age >= p.life) {
          particles.splice(i, 1);
          continue;
        }
        const n = turbulence(p.x + p.seed, p.y, time);
        if (p.ember) {
          p.vx += n * 90 * dt;
          p.vy -= 60 * dt; // embers float slowly
          p.vx *= 0.985;
          p.vy *= 0.985;
        } else {
          // Buoyancy: hot gas rises. Turbulence grows with age, so the
          // base stays compact while the upper tongues sway and split.
          const age = p.age / p.life;
          p.vy -= 380 * dt;
          p.vx += n * (120 + 520 * age) * dt;
          p.vx *= 0.92;
          p.vy *= 0.97;
        }
        p.x += p.vx * dt;
        p.y += p.vy * dt;
      }

      // Draw
      ctx.clearRect(0, 0, width, height);
      ctx.globalCompositeOperation = dark ? "lighter" : "source-over";
      for (const p of particles) {
        const t = p.age / p.life;
        if (p.ember) {
          const twinkle = 0.55 + 0.45 * Math.sin(time * 30 + p.seed);
          const [r, g, b] = lerpRamp(ramp, t * 0.6);
          ctx.globalAlpha = (1 - t) * twinkle;
          ctx.fillStyle = `rgb(${r},${g},${b})`;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * (1 - t * 0.5), 0, Math.PI * 2);
          ctx.fill();
          continue;
        }
        // Flames narrow and cool as they rise; a flicker term keeps the
        // body of the flame breathing.
        const flicker = 0.85 + 0.15 * Math.sin(time * 24 + p.seed);
        const size = p.size * (1 - t * 0.8) * flicker;
        const sprite = sprites[Math.min(STEPS - 1, Math.floor(t * STEPS))];
        ctx.globalAlpha = Math.pow(1 - t, 1.1) * (dark ? 0.75 : 0.55);
        ctx.drawImage(sprite, p.x - size, p.y - size, size * 2, size * 2);
      }
      ctx.globalAlpha = 1;

      // Hot core at the exact pointer position.
      if (pointer.inside) {
        const pulse =
          1 + Math.sin(time * 18) * 0.08 + (pointer.down ? 0.35 : 0);
        const halo = ctx.createRadialGradient(
          pointer.x,
          pointer.y,
          0,
          pointer.x,
          pointer.y,
          16 * pulse,
        );
        halo.addColorStop(
          0,
          dark ? "rgba(235,250,255,0.95)" : "rgba(14,116,144,0.9)",
        );
        halo.addColorStop(
          0.35,
          dark ? "rgba(90,210,255,0.55)" : "rgba(37,99,235,0.35)",
        );
        halo.addColorStop(1, "rgba(60,120,255,0)");
        ctx.fillStyle = halo;
        ctx.beginPath();
        ctx.arc(pointer.x, pointer.y, 16 * pulse, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalCompositeOperation = "source-over";
        ctx.fillStyle = dark ? "#ffffff" : "#0c4a6e";
        ctx.beginPath();
        ctx.arc(pointer.x, pointer.y, 2.2, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalCompositeOperation = "source-over";

      // Sleep once the fire is out and the pointer is gone.
      if (!pointer.inside && particles.length === 0) {
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
        lastX = e.clientX;
        lastY = e.clientY;
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
      pointer.down = true;
      sparkBurst(26);
      wake();
    };
    const onUp = () => {
      pointer.down = false;
    };
    const onLeave = () => {
      pointer.inside = false;
    };

    resize();
    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerover", onOver);
    window.addEventListener("pointerdown", onDown);
    window.addEventListener("pointerup", onUp);
    root.addEventListener("pointerleave", onLeave);

    return () => {
      cancelAnimationFrame(raf);
      root.classList.remove("has-custom-cursor");
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerover", onOver);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
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
