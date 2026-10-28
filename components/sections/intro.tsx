"use client";

import * as React from "react";
import Link from "next/link";
import { useTheme } from "next-themes";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowDown, MousePointerClick } from "lucide-react";

import { intro, type IntroPhrase } from "@/content/site-data";
import { LightRunner } from "@/components/light-runner";

/** Brand violet + cyan, matched to the CSS design tokens. */
const BRAND = [139, 92, 246];
const CYAN = [34, 211, 238];
const BRAND_LIGHT = [109, 40, 217];
const CYAN_LIGHT = [8, 145, 178];
const COLOR_STEPS = 12;

const SPRING = 0.045;
const FRICTION = 0.86;
const REPEL_RADIUS = 110;
const REPEL_FORCE = 2.6;
const BURST_RADIUS = 280;
/** Time a phrase stays up: a base plus a bit per character to read it. */
const HOLD_BASE_MS = 3200;
const HOLD_PER_CHAR_MS = 70;
const MAX_PARTICLES = 4200;
const MAX_LINES = 3;
/** Press-and-hold this long to charge the particles and start the game. */
const CHARGE_MS = 1300;
/** Presses shorter than this are clicks (morph), not charges. */
const CLICK_MAX_MS = 350;
const MONO_FONT = "ui-monospace, 'SFMono-Regular', Menlo, Consolas, monospace";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  tx: number;
  ty: number;
  /** 0–1 brightness boost from the pointer passing nearby. */
  glow: number;
  /** Particles not needed for the current word float around as dust. */
  dust: boolean;
  seed: number;
}

/** Pre-render one soft glowing dot per color step (violet → cyan). */
function makeSprites(dark: boolean) {
  const from = dark ? BRAND : BRAND_LIGHT;
  const to = dark ? CYAN : CYAN_LIGHT;
  return Array.from({ length: COLOR_STEPS }, (_, i) => {
    const t = i / (COLOR_STEPS - 1);
    const c = from.map((v, k) => Math.round(v + (to[k] - v) * t)).join(",");
    const sprite = document.createElement("canvas");
    sprite.width = sprite.height = 32;
    const ctx = sprite.getContext("2d")!;
    const g = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
    if (dark) {
      g.addColorStop(0, "rgba(255,255,255,1)");
      g.addColorStop(0.15, `rgba(${c},1)`);
      g.addColorStop(0.4, `rgba(${c},0.35)`);
    } else {
      g.addColorStop(0, `rgba(${c},1)`);
      g.addColorStop(0.22, `rgba(${c},0.95)`);
      g.addColorStop(0.45, `rgba(${c},0.2)`);
    }
    g.addColorStop(1, `rgba(${c},0)`);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 32, 32);
    return sprite;
  });
}

/**
 * Split a phrase into 1–3 balanced lines and pick the font size that
 * fills the space best (fewer lines win unless more lines are much bigger).
 */
function layoutLines(
  ctx: CanvasRenderingContext2D,
  text: string,
  w: number,
  h: number,
  font: string,
) {
  const words = text.split(" ");
  ctx.font = `700 100px ${font}`;
  const measure = (t: string) => ctx.measureText(t).width;
  const space = measure(" ");
  let best = { lines: [text], fontSize: 0 };

  for (let n = 1; n <= Math.min(MAX_LINES, words.length); n++) {
    const target = measure(text) / n;
    const lines: string[] = [];
    let current = "";
    for (const word of words) {
      const next = current ? `${current} ${word}` : word;
      if (current && measure(next) > target + space && lines.length < n - 1) {
        lines.push(current);
        current = word;
      } else {
        current = next;
      }
    }
    lines.push(current);

    const widest = Math.max(...lines.map(measure));
    const fontSize = Math.min(
      (w * 0.86 * 100) / widest,
      (h * 0.56) / (lines.length * 1.15),
      240,
    );
    if (fontSize > best.fontSize * 1.2) best = { lines, fontSize };
  }
  return best;
}

/** Render the phrase off-screen and return evenly spaced points inside it. */
function sampleText(
  phrase: IntroPhrase,
  w: number,
  h: number,
  displayFont: string,
) {
  const off = document.createElement("canvas");
  off.width = Math.max(1, Math.floor(w));
  off.height = Math.max(1, Math.floor(h));
  const ctx = off.getContext("2d", { willReadFrequently: true })!;

  const font = phrase.code ? MONO_FONT : displayFont;
  const { lines, fontSize } = layoutLines(ctx, phrase.text, w, h, font);
  const lineHeight = fontSize * 1.15;

  ctx.font = `700 ${fontSize}px ${font}`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = "#000";
  // Sit the block slightly above centre to leave room for the caption.
  const top = off.height * 0.47 - ((lines.length - 1) * lineHeight) / 2;
  lines.forEach((line, i) => {
    ctx.fillText(line, off.width / 2, top + i * lineHeight);
  });
  const data = ctx.getImageData(0, 0, off.width, off.height).data;

  let gap = Math.max(3, Math.round(fontSize / 36));
  let points: Array<[number, number]> = [];
  do {
    points = [];
    for (let y = 0; y < off.height; y += gap) {
      for (let x = 0; x < off.width; x += gap) {
        if (data[(y * off.width + x) * 4 + 3] > 128) points.push([x, y]);
      }
    }
    gap++;
  } while (points.length > MAX_PARTICLES);

  return { points, gap: gap - 1 };
}

export function Intro() {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  // Kept outside the effect so a theme switch doesn't scatter the word.
  const particlesRef = React.useRef<Particle[]>([]);
  const phraseIndexRef = React.useRef(0);
  const [phrase, setPhrase] = React.useState(intro.phrases[0]);
  const [playing, setPlaying] = React.useState(false);
  const reduceMotion = useReducedMotion();
  const { resolvedTheme } = useTheme();
  const dark = resolvedTheme !== "light";

  React.useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    // While the game runs the particle scene sleeps; on exit this effect
    // re-runs and the scattered particles fly back into the phrase.
    if (!container || !canvas || !ctx || playing) return;

    const particles = particlesRef.current;
    const sprites = makeSprites(dark);
    const fontFamily =
      getComputedStyle(document.documentElement)
        .getPropertyValue("--font-display")
        .trim() || "sans-serif";
    const pointer = { x: 0, y: 0, active: false };
    let width = 0;
    let height = 0;
    let dotSize = 8;
    let raf = 0;
    let visible = true;
    let lastMorph = performance.now();
    let cancelled = false;
    // Press-and-hold state.
    const charge = { active: false, start: 0, x: 0, y: 0 };
    let pressStart = 0;
    let suppressClick = false;
    let exploding = false;
    let timer = 0;

    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      ctx.globalCompositeOperation = dark ? "lighter" : "source-over";
      for (const p of particles) {
        const step = Math.floor((p.x / width) * COLOR_STEPS);
        const sprite = sprites[Math.min(COLOR_STEPS - 1, Math.max(0, step))];
        const size = (p.dust ? dotSize * 0.6 : dotSize) * (1 + p.glow * 1.3);
        ctx.globalAlpha = p.dust ? 0.3 : Math.min(1, 0.6 + p.glow * 0.4);
        ctx.drawImage(sprite, p.x - size / 2, p.y - size / 2, size, size);
      }
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = "source-over";
      drawChargeRing();
    };

    // Ring of light that fills up around the pointer while holding.
    const drawChargeRing = () => {
      if (!charge.active) return;
      const p = Math.min(1, (performance.now() - charge.start) / CHARGE_MS);
      if (p < 0.12) return;
      const radius = 30 + Math.sin(performance.now() / 60) * p * 3;
      ctx.lineCap = "round";
      ctx.lineWidth = 3;
      ctx.strokeStyle = dark ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.12)";
      ctx.beginPath();
      ctx.arc(charge.x, charge.y, radius, 0, Math.PI * 2);
      ctx.stroke();
      ctx.shadowColor = "#8b5cf6";
      ctx.shadowBlur = 16;
      ctx.strokeStyle = dark ? "#a78bfa" : "#6d28d9";
      ctx.beginPath();
      ctx.arc(
        charge.x,
        charge.y,
        radius,
        -Math.PI / 2,
        -Math.PI / 2 + ((p - 0.12) / 0.88) * Math.PI * 2,
      );
      ctx.stroke();
      ctx.shadowBlur = 0;
    };

    const explode = () => {
      charge.active = false;
      suppressClick = true;
      exploding = true;
      for (const p of particles) {
        const dx = p.x - charge.x;
        const dy = p.y - charge.y;
        const d = Math.hypot(dx, dy) || 1;
        const v = 18 + Math.random() * 30;
        p.vx = (dx / d) * v;
        p.vy = (dy / d) * v;
        p.glow = 1;
      }
      timer = window.setTimeout(() => setPlaying(true), 480);
    };

    // Point every particle at a spot in the current word; leftovers drift
    // around as dust, and new particles spawn scattered across the canvas.
    const retarget = () => {
      if (!width || !height) return;
      const { points, gap } = sampleText(
        intro.phrases[phraseIndexRef.current],
        width,
        height,
        fontFamily,
      );
      dotSize = gap * 2.4;
      for (let i = points.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [points[i], points[j]] = [points[j], points[i]];
      }
      while (particles.length < points.length) {
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: 0,
          vy: 0,
          tx: 0,
          ty: 0,
          glow: 0,
          dust: true,
          seed: Math.random() * 1000,
        });
      }
      particles.forEach((p, i) => {
        if (i < points.length) {
          [p.tx, p.ty] = points[i];
          p.dust = false;
        } else {
          p.tx = Math.random() * width;
          p.ty = Math.random() * height;
          p.dust = true;
        }
        if (reduceMotion) {
          p.x = p.tx;
          p.y = p.ty;
        }
      });
      if (reduceMotion) draw();
    };

    const morph = (burstX?: number, burstY?: number) => {
      phraseIndexRef.current =
        (phraseIndexRef.current + 1) % intro.phrases.length;
      setPhrase(intro.phrases[phraseIndexRef.current]);
      lastMorph = performance.now();
      if (burstX !== undefined && burstY !== undefined && !reduceMotion) {
        for (const p of particles) {
          const dx = p.x - burstX;
          const dy = p.y - burstY;
          const d = Math.hypot(dx, dy) || 1;
          if (d < BURST_RADIUS) {
            const f = (1 - d / BURST_RADIUS) * 22;
            p.vx += (dx / d) * f;
            p.vy += (dy / d) * f;
            p.glow = 1;
          }
        }
      }
      retarget();
    };

    const step = () => {
      const now = performance.now();
      const hold =
        HOLD_BASE_MS +
        intro.phrases[phraseIndexRef.current].text.length * HOLD_PER_CHAR_MS;
      if (!pointer.active && !exploding && now - lastMorph > hold) morph();

      const chargeLevel = charge.active
        ? Math.min(1, (now - charge.start) / CHARGE_MS)
        : 0;
      if (chargeLevel >= 1) explode();

      for (const p of particles) {
        if (exploding) {
          // Free flight outward — no springs until the game takes over.
          p.vx *= 0.96;
          p.vy *= 0.96;
          p.x += p.vx;
          p.y += p.vy;
          continue;
        }
        if (chargeLevel > 0.12) {
          // Charging: get pulled toward the pointer and shake harder.
          p.vx += (charge.x - p.x) * 0.0035 * chargeLevel;
          p.vy += (charge.y - p.y) * 0.0035 * chargeLevel;
          p.vx += (Math.random() - 0.5) * chargeLevel * 2;
          p.vy += (Math.random() - 0.5) * chargeLevel * 2;
          p.glow = Math.max(p.glow, chargeLevel * 0.8);
        }
        if (p.dust) {
          p.tx += Math.cos(now * 0.0003 + p.seed) * 0.4;
          p.ty += Math.sin(now * 0.0004 + p.seed) * 0.4;
        }
        const spring = p.dust ? SPRING * 0.15 : SPRING;
        p.vx += (p.tx - p.x) * spring;
        p.vy += (p.ty - p.y) * spring;

        if (pointer.active && !charge.active) {
          const dx = p.x - pointer.x;
          const dy = p.y - pointer.y;
          const d2 = dx * dx + dy * dy;
          if (d2 < REPEL_RADIUS * REPEL_RADIUS) {
            const d = Math.sqrt(d2) || 1;
            const proximity = 1 - d / REPEL_RADIUS;
            p.vx += (dx / d) * proximity * REPEL_FORCE;
            p.vy += (dy / d) * proximity * REPEL_FORCE;
            p.glow = Math.max(p.glow, proximity);
          }
        }

        p.vx *= FRICTION;
        p.vy *= FRICTION;
        p.x += p.vx;
        p.y += p.vy;
        p.glow *= 0.95;
      }

      draw();
      raf = requestAnimationFrame(step);
    };

    const start = () => {
      if (reduceMotion || raf || !visible || cancelled) return;
      raf = requestAnimationFrame(step);
    };
    const stop = () => {
      cancelAnimationFrame(raf);
      raf = 0;
    };

    const resize = () => {
      const rect = container.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      retarget();
    };

    const onMove = (e: PointerEvent) => {
      const rect = container.getBoundingClientRect();
      pointer.x = e.clientX - rect.left;
      pointer.y = e.clientY - rect.top;
      pointer.active = true;
      if (charge.active) {
        charge.x = pointer.x;
        charge.y = pointer.y;
      }
    };
    const endCharge = () => {
      charge.active = false;
      if (reduceMotion) window.clearTimeout(timer);
    };
    const onLeave = () => {
      pointer.active = false;
      endCharge();
    };
    const onDown = (e: PointerEvent) => {
      if (e.button !== 0 || (e.target as Element).closest("a, button")) return;
      const rect = container.getBoundingClientRect();
      pressStart = performance.now();
      suppressClick = false;
      Object.assign(charge, {
        active: true,
        start: pressStart,
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
      // No animation loop with reduced motion: just start after the hold.
      if (reduceMotion) {
        timer = window.setTimeout(() => {
          suppressClick = true;
          setPlaying(true);
        }, CHARGE_MS);
      }
    };
    const onClick = (e: MouseEvent) => {
      if ((e.target as Element).closest("a, button")) return;
      if (suppressClick || performance.now() - pressStart > CLICK_MAX_MS)
        return;
      const rect = container.getBoundingClientRect();
      morph(e.clientX - rect.left, e.clientY - rect.top);
    };

    resize();
    // Re-sample once the display font has loaded so letters use it.
    document.fonts?.ready.then(() => {
      if (!cancelled) retarget();
    });

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(container);
    const intersectionObserver = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        if (visible) start();
        else stop();
      },
      { threshold: 0.05 },
    );
    intersectionObserver.observe(container);

    container.addEventListener("pointermove", onMove);
    container.addEventListener("pointerleave", onLeave);
    container.addEventListener("pointerdown", onDown);
    container.addEventListener("pointerup", endCharge);
    container.addEventListener("pointercancel", endCharge);
    container.addEventListener("click", onClick);
    start();

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
      stop();
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      container.removeEventListener("pointermove", onMove);
      container.removeEventListener("pointerleave", onLeave);
      container.removeEventListener("pointerdown", onDown);
      container.removeEventListener("pointerup", endCharge);
      container.removeEventListener("pointercancel", endCharge);
      container.removeEventListener("click", onClick);
    };
  }, [dark, reduceMotion, playing]);

  return (
    <section
      id="intro"
      aria-label="Interactive intro"
      className="relative flex min-h-[100svh] items-center justify-center overflow-hidden"
    >
      {/* Soft light pooling behind the particles */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 h-[60vmin] w-[90vmin] -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand/15 blur-[120px]"
      />
      <div aria-hidden className="bg-dotted absolute inset-0 opacity-40" />

      <div
        ref={containerRef}
        className="absolute inset-0 touch-pan-y select-none"
      >
        <canvas
          ref={canvasRef}
          role="img"
          aria-label={`Glowing particles spelling “${phrase.text}”${phrase.by ? ` — ${phrase.by}` : ""}`}
          className={`h-full w-full transition-opacity duration-700 ${playing ? "opacity-0" : "opacity-100"}`}
        />
      </div>

      {playing ? (
        <LightRunner dark={dark} onExit={() => setPlaying(false)} />
      ) : null}

      {/* Quote author */}
      <div className="pointer-events-none absolute inset-x-0 bottom-[22%] flex justify-center px-6 md:bottom-[20%]">
        <AnimatePresence mode="wait">
          {phrase.by && !playing ? (
            <motion.p
              key={phrase.text}
              initial={{ opacity: 0, y: 8, filter: "blur(4px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -8, filter: "blur(4px)" }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="inline-flex items-center gap-3 font-display text-base text-muted-foreground md:text-lg"
            >
              <span className="h-px w-8 bg-gradient-to-r from-transparent to-brand" />
              {phrase.by}
              <span className="h-px w-8 bg-gradient-to-l from-transparent to-cyan" />
            </motion.p>
          ) : null}
        </AnimatePresence>
      </div>

      {!playing ? (
        <>
          <p className="pointer-events-none absolute top-24 inline-flex items-center gap-2 rounded-full border border-border bg-background/40 px-4 py-1.5 text-xs font-medium uppercase tracking-widest text-muted-foreground backdrop-blur">
            <span className="size-1.5 rounded-full bg-brand shadow-[0_0_8px_2px_hsl(var(--brand))]" />
            {intro.eyebrow}
          </p>

          <div className="pointer-events-none absolute bottom-8 flex flex-col items-center gap-4 px-6 text-center">
            <p className="inline-flex items-center gap-2 text-sm text-muted-foreground">
              <MousePointerClick className="size-4 text-brand" />
              {intro.hint}
            </p>
            <Link
              href={intro.cta.href}
              className="pointer-events-auto inline-flex flex-col items-center gap-1 text-sm font-medium text-foreground/80 transition-colors hover:text-brand"
            >
              {intro.cta.label}
              <ArrowDown className="size-5 animate-bounce" />
            </Link>
          </div>
        </>
      ) : null}
    </section>
  );
}
