"use client";

import * as React from "react";
import { Volume2, VolumeX, X } from "lucide-react";

/*
 * Light Runner — an original endless runner drawn in light. The player is a glowing
 * orb; neon cacti grow from the ground and line-art flying dinos swoop at
 * three heights. Jump: Space / ↑ / click / tap. Duck: ↓ / swipe down.
 * Escape exits.
 */

type Phase = "ready" | "running" | "over";

interface Obstacle {
  kind: "cactus" | "dino";
  x: number;
  /** Top edge (dinos) — cacti are anchored to the ground. */
  y: number;
  w: number;
  h: number;
  /** Heights of each cactus in a cluster. */
  cacti: number[];
  seed: number;
}

interface Spark {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  hue: string;
}

interface Box {
  x: number;
  y: number;
  w: number;
  h: number;
}

const BEST_KEY = "light-runner-best";
const MUTE_KEY = "light-runner-muted";
const MILESTONE = 500;

function readBest() {
  try {
    return Number(localStorage.getItem(BEST_KEY)) || 0;
  } catch {
    return 0;
  }
}

function writeBest(value: number) {
  try {
    localStorage.setItem(BEST_KEY, String(value));
  } catch {
    /* storage unavailable — best score just won't persist */
  }
}

/**
 * Tiny synthesizer for the game's sound effects (Web Audio, no files).
 * The audio context is created lazily on the first sound, which always
 * follows a key press or tap, so browsers allow it.
 */
function createSfx() {
  let ac: AudioContext | null = null;
  const audio = () => {
    if (!ac) {
      const AC =
        window.AudioContext ??
        (window as unknown as { webkitAudioContext?: typeof AudioContext })
          .webkitAudioContext;
      ac = AC ? new AC() : null;
    }
    if (ac?.state === "suspended") void ac.resume();
    return ac;
  };

  const tone = (
    from: number,
    to: number,
    duration: number,
    type: OscillatorType,
    volume: number,
    delay = 0,
  ) => {
    const a = audio();
    if (!a) return;
    const t = a.currentTime + delay;
    const osc = a.createOscillator();
    const gain = a.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(from, t);
    osc.frequency.exponentialRampToValueAtTime(to, t + duration);
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(volume, t + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + duration);
    osc.connect(gain).connect(a.destination);
    osc.start(t);
    osc.stop(t + duration + 0.02);
  };

  const noise = (duration: number, volume: number) => {
    const a = audio();
    if (!a) return;
    const buffer = a.createBuffer(1, a.sampleRate * duration, a.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) {
      data[i] = (Math.random() * 2 - 1) * (1 - i / data.length);
    }
    const src = a.createBufferSource();
    const filter = a.createBiquadFilter();
    const gain = a.createGain();
    src.buffer = buffer;
    filter.type = "lowpass";
    filter.frequency.value = 900;
    gain.gain.value = volume;
    src.connect(filter).connect(gain).connect(a.destination);
    src.start();
  };

  return {
    jump: () => tone(330, 820, 0.14, "triangle", 0.14),
    milestone: () => {
      tone(784, 784, 0.1, "sine", 0.12);
      tone(1175, 1175, 0.16, "sine", 0.12, 0.09);
    },
    crash: () => {
      noise(0.4, 0.35);
      tone(260, 45, 0.5, "sawtooth", 0.07);
    },
    close: () => void ac?.close(),
  };
}

const rand = (a: number, b: number) => a + Math.random() * (b - a);
const overlaps = (a: Box, b: Box) =>
  a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;

export function LightRunner({
  dark,
  onExit,
}: {
  dark: boolean;
  onExit: () => void;
}) {
  const wrapRef = React.useRef<HTMLDivElement>(null);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const scoreRef = React.useRef<HTMLSpanElement>(null);
  const [phase, setPhase] = React.useState<Phase>("ready");
  const [finalScore, setFinalScore] = React.useState(0);
  const [best, setBest] = React.useState(0);
  const [muted, setMuted] = React.useState(false);
  const mutedRef = React.useRef(false);
  mutedRef.current = muted;
  const onExitRef = React.useRef(onExit);
  onExitRef.current = onExit;

  React.useEffect(() => {
    setBest(readBest());
    try {
      setMuted(localStorage.getItem(MUTE_KEY) === "1");
    } catch {
      /* default: sound on */
    }
  }, []);

  const toggleMute = React.useCallback(() => {
    setMuted((m) => {
      try {
        localStorage.setItem(MUTE_KEY, m ? "0" : "1");
      } catch {
        /* preference just won't persist */
      }
      return !m;
    });
  }, []);
  const toggleMuteRef = React.useRef(toggleMute);
  toggleMuteRef.current = toggleMute;

  React.useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!wrap || !canvas || !ctx) return;

    const C = dark
      ? {
          a: "#8b5cf6",
          b: "#22d3ee",
          core: "#ffffff",
          soft: "#c4b5fd",
          bg: "#0c0911",
          tint: "rgba(34,211,238,0.14)",
        }
      : {
          a: "#6d28d9",
          b: "#0891b2",
          core: "#ffffff",
          soft: "#7c3aed",
          bg: "#ffffff",
          tint: "rgba(8,145,178,0.12)",
        };

    // Geometry, recomputed on resize. `u` is the size unit everything
    // scales from, so the game feels the same on phones and desktops.
    let W = 0;
    let H = 0;
    let u = 1;
    let ground = 0;
    let px = 0;
    let r = 0;

    const g = {
      phase: "ready" as Phase,
      t: 0,
      speed: 0,
      distance: 0,
      score: 0,
      lastMilestone: 0,
      py: 0, // height above ground
      vy: 0,
      ducking: false,
      duckHeld: false,
      duckUntil: 0,
      jumpHeld: false,
      jumpBufferedAt: -1,
      obstacles: [] as Obstacle[],
      sparks: [] as Spark[],
      trail: [] as number[],
      stars: [] as { x: number; y: number; z: number }[],
      overAt: 0,
    };

    const resize = () => {
      const rect = wrap.getBoundingClientRect();
      W = rect.width;
      H = rect.height;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(W * dpr);
      canvas.height = Math.floor(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      u = Math.min(H, W * 1.1);
      ground = H * 0.72;
      px = Math.max(56, W * 0.15);
      r = u * 0.034;
      g.stars = Array.from({ length: 70 }, () => ({
        x: Math.random() * W,
        y: Math.random() * ground * 0.9,
        z: rand(0.2, 1),
      }));
    };

    const reset = () => {
      g.t = 0;
      g.speed = u * 0.62;
      g.distance = 0;
      g.score = 0;
      g.lastMilestone = 0;
      g.py = 0;
      g.vy = 0;
      g.obstacles = [];
      g.trail = [];
      g.duckUntil = 0;
    };

    const sfx = createSfx();
    const play = (name: "jump" | "milestone" | "crash") => {
      if (!mutedRef.current) sfx[name]();
    };

    const setGamePhase = (next: Phase) => {
      g.phase = next;
      setPhase(next);
    };

    const burst = (x: number, y: number, count: number, power: number) => {
      for (let i = 0; i < count; i++) {
        const a = rand(0, Math.PI * 2);
        const v = rand(0.3, 1) * power;
        g.sparks.push({
          x,
          y,
          vx: Math.cos(a) * v,
          vy: Math.sin(a) * v,
          life: 1,
          hue: Math.random() > 0.5 ? C.a : C.b,
        });
      }
    };

    // ---------------------------------------------------------------- input
    const jump = () => {
      if (g.phase === "ready") {
        reset();
        setGamePhase("running");
      } else if (g.phase === "over") {
        if (g.t - g.overAt < 0.5) return;
        reset();
        setGamePhase("running");
        return;
      }
      if (g.py <= 0.5) {
        g.vy = u * 1.32;
        play("jump");
        burst(px, ground, 8, u * 0.25);
      } else {
        g.jumpBufferedAt = g.t;
      }
    };
    const releaseJump = () => {
      g.jumpHeld = false;
    };

    const onKeyDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement | null)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      if (e.code === "Escape") {
        onExitRef.current();
        return;
      }
      if (e.code === "KeyM") {
        toggleMuteRef.current();
        return;
      }
      if (["Space", "ArrowUp", "KeyW"].includes(e.code)) {
        e.preventDefault();
        if (!e.repeat) {
          g.jumpHeld = true;
          jump();
        }
      } else if (["ArrowDown", "KeyS"].includes(e.code)) {
        e.preventDefault();
        g.duckHeld = true;
      }
    };
    const onKeyUp = (e: KeyboardEvent) => {
      if (["Space", "ArrowUp", "KeyW"].includes(e.code)) releaseJump();
      if (["ArrowDown", "KeyS"].includes(e.code)) g.duckHeld = false;
    };

    let touchStartY: number | null = null;
    const onPointerDown = (e: PointerEvent) => {
      if ((e.target as Element).closest("button, a")) return;
      if (e.pointerType === "mouse") {
        if (e.button !== 0) return;
        g.jumpHeld = true;
        jump();
      } else {
        touchStartY = e.clientY;
      }
    };
    const onPointerUp = (e: PointerEvent) => {
      if (e.pointerType === "mouse") {
        releaseJump();
        return;
      }
      if (touchStartY === null) return;
      const dy = e.clientY - touchStartY;
      touchStartY = null;
      if (dy > 30) {
        g.duckUntil = g.t + 0.7; // swipe down = duck
      } else {
        jump();
        releaseJump();
      }
    };

    // ---------------------------------------------------------- obstacles
    const spawn = () => {
      const canFly = g.score > 150;
      if (canFly && Math.random() < 0.3) {
        const w = u * 0.11;
        const h = u * 0.06;
        const altitude = [
          ground - u * 0.012 - h, // low: jump over
          ground - r * 1.2 - h, // mid: duck under
          ground - r * 2.7 - h, // high: stay down
        ][Math.floor(Math.random() * 3)];
        g.obstacles.push({
          kind: "dino",
          x: W + 20,
          y: altitude,
          w,
          h,
          cacti: [],
          seed: Math.random() * 10,
        });
      } else {
        const count =
          g.score > 300 && Math.random() < 0.25
            ? 3
            : Math.random() < 0.4
              ? 2
              : 1;
        const cactusW = u * 0.055;
        const cacti = Array.from({ length: count }, () =>
          rand(u * 0.1, u * 0.16),
        );
        g.obstacles.push({
          kind: "cactus",
          x: W + 20,
          y: ground - Math.max(...cacti),
          w: cactusW * count,
          h: Math.max(...cacti),
          cacti,
          seed: Math.random() * 10,
        });
      }
    };

    const hitboxes = (o: Obstacle): Box[] => {
      if (o.kind === "dino") {
        return [
          {
            x: o.x + o.w * 0.12,
            y: o.y + o.h * 0.25,
            w: o.w * 0.76,
            h: o.h * 0.55,
          },
        ];
      }
      const pw = o.w / o.cacti.length;
      return o.cacti.map((h, i) => ({
        x: o.x + i * pw + pw * 0.14,
        y: ground - h + h * 0.08,
        w: pw * 0.72,
        h: h * 0.92,
      }));
    };

    const playerBox = (): Box => {
      if (g.ducking) {
        const rx = r * 1.35;
        const ry = r * 0.55;
        return {
          x: px - rx * 0.8,
          y: ground - ry * 1.7,
          w: rx * 1.6,
          h: ry * 1.7,
        };
      }
      const cy = ground - r - g.py;
      return { x: px - r * 0.72, y: cy - r * 0.72, w: r * 1.44, h: r * 1.44 };
    };

    // --------------------------------------------------------------- draw
    const glow = (color: string, blur: number) => {
      ctx.shadowColor = color;
      ctx.shadowBlur = blur;
    };

    // Neon saguaro: a glowing outline traced around a trunk and up to two
    // arms, filled with a faint tint, plus a rib down the middle.
    const drawCactus = (x: number, h: number, w: number, seed: number) => {
      const cx = x + w / 2;
      const tw = w * 0.34;
      const armW = tw * 0.72;
      const top = ground - h;
      const lw = Math.max(2, u * 0.005);
      const trunk = new Path2D();
      trunk.moveTo(cx, ground - tw / 2);
      trunk.lineTo(cx, top + tw / 2);
      const arms = new Path2D();
      if (Math.sin(seed * 3.1) > -0.5) {
        const ly = ground - h * (0.38 + ((seed * 7) % 1) * 0.12);
        arms.moveTo(cx, ly);
        arms.lineTo(cx - w * 0.36, ly);
        arms.lineTo(cx - w * 0.36, ly - h * 0.24);
      }
      if (Math.cos(seed * 2.3) > -0.3) {
        const ry = ground - h * (0.52 + ((seed * 5) % 1) * 0.12);
        arms.moveTo(cx, ry);
        arms.lineTo(cx + w * 0.36, ry);
        arms.lineTo(cx + w * 0.36, ry - h * 0.2);
      }
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      // Outline
      ctx.strokeStyle = C.b;
      glow(C.b, 14);
      ctx.lineWidth = tw + lw * 2;
      ctx.stroke(trunk);
      ctx.lineWidth = armW + lw * 2;
      ctx.stroke(arms);
      ctx.shadowBlur = 0;
      // Hollow it out, then tint
      for (const color of [C.bg, C.tint]) {
        ctx.strokeStyle = color;
        ctx.lineWidth = tw;
        ctx.stroke(trunk);
        ctx.lineWidth = armW;
        ctx.stroke(arms);
      }
      // Rib
      ctx.globalAlpha = 0.6;
      ctx.strokeStyle = C.b;
      ctx.lineWidth = Math.max(1, u * 0.0025);
      ctx.beginPath();
      ctx.moveTo(cx, ground - tw * 0.6);
      ctx.lineTo(cx, top + tw * 0.6);
      ctx.stroke();
      ctx.globalAlpha = 1;
    };

    const drawDino = (o: Obstacle) => {
      const cx = o.x + o.w / 2;
      const cy = o.y + o.h / 2;
      const { w, h } = o;
      const flap = Math.sin(g.t * 11 + o.seed);
      ctx.lineJoin = "round";
      ctx.lineCap = "round";
      ctx.strokeStyle = C.a;
      ctx.fillStyle = dark ? "rgba(139,92,246,0.18)" : "rgba(109,40,217,0.12)";
      glow(C.a, 14);
      ctx.lineWidth = Math.max(2, u * 0.006);
      // Wings (flapping)
      ctx.beginPath();
      ctx.moveTo(cx - w * 0.12, cy);
      ctx.lineTo(cx + w * 0.05, cy - h * 1.15 * flap);
      ctx.lineTo(cx + w * 0.32, cy + h * 0.05);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      // Body + tail
      ctx.beginPath();
      ctx.ellipse(cx, cy + h * 0.05, w * 0.22, h * 0.2, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(cx + w * 0.2, cy + h * 0.05);
      ctx.lineTo(cx + w * 0.5, cy + h * 0.15);
      ctx.stroke();
      // Neck, head, beak and crest
      ctx.strokeStyle = C.b;
      glow(C.b, 12);
      ctx.beginPath();
      ctx.moveTo(cx - w * 0.2, cy);
      ctx.lineTo(cx - w * 0.34, cy - h * 0.25);
      ctx.lineTo(cx - w * 0.56, cy - h * 0.1);
      ctx.moveTo(cx - w * 0.34, cy - h * 0.25);
      ctx.lineTo(cx - w * 0.2, cy - h * 0.55);
      ctx.stroke();
      ctx.fillStyle = C.core;
      ctx.beginPath();
      ctx.arc(
        cx - w * 0.33,
        cy - h * 0.2,
        Math.max(1.5, u * 0.004),
        0,
        Math.PI * 2,
      );
      ctx.fill();
    };

    const drawPlayer = () => {
      const cy = ground - (g.ducking ? r * 0.55 : r) - g.py;
      // Light trail
      g.trail.unshift(cy);
      if (g.trail.length > 12) g.trail.pop();
      for (let i = g.trail.length - 1; i > 0; i--) {
        const alpha = (1 - i / g.trail.length) * 0.35;
        ctx.globalAlpha = alpha;
        ctx.fillStyle = i % 2 ? C.a : C.b;
        ctx.beginPath();
        ctx.arc(
          px - i * r * 0.55,
          g.trail[i],
          r * (1 - i / 16),
          0,
          Math.PI * 2,
        );
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      // Halo
      const halo = ctx.createRadialGradient(px, cy, 0, px, cy, r * 2.6);
      halo.addColorStop(
        0,
        dark ? "rgba(196,181,253,0.55)" : "rgba(124,58,237,0.35)",
      );
      halo.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = halo;
      ctx.beginPath();
      ctx.arc(px, cy, r * 2.6, 0, Math.PI * 2);
      ctx.fill();
      // Core
      glow(C.a, 24);
      ctx.fillStyle = C.core;
      ctx.strokeStyle = C.a;
      ctx.lineWidth = Math.max(2, u * 0.006);
      ctx.beginPath();
      if (g.ducking) ctx.ellipse(px, cy, r * 1.35, r * 0.55, 0, 0, Math.PI * 2);
      else ctx.arc(px, cy, r, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      // Inner shine
      ctx.shadowBlur = 0;
      ctx.fillStyle = C.b;
      ctx.globalAlpha = 0.5;
      ctx.beginPath();
      ctx.arc(
        px + r * 0.25,
        cy - (g.ducking ? 0 : r * 0.2),
        r * 0.32,
        0,
        Math.PI * 2,
      );
      ctx.fill();
      ctx.globalAlpha = 1;
    };

    const ridge = (x: number) =>
      Math.sin(x * 0.004) * 0.5 +
      Math.sin(x * 0.011 + 1.3) * 0.3 +
      Math.sin(x * 0.023) * 0.2;

    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      ctx.shadowBlur = 0;

      // Stars
      for (const s of g.stars) {
        ctx.globalAlpha = 0.25 + s.z * 0.5;
        ctx.fillStyle = s.z > 0.7 ? C.b : C.soft;
        ctx.fillRect(s.x, s.y, s.z * 2, s.z * 2);
      }
      ctx.globalAlpha = 1;

      // Distant ridge
      const offset = g.distance * 0.12;
      ctx.beginPath();
      ctx.moveTo(0, ground);
      for (let x = 0; x <= W; x += 8) {
        ctx.lineTo(x, ground - u * 0.12 - ridge(x + offset) * u * 0.07);
      }
      ctx.lineTo(W, ground);
      ctx.closePath();
      const fill = ctx.createLinearGradient(0, ground - u * 0.25, 0, ground);
      fill.addColorStop(
        0,
        dark ? "rgba(139,92,246,0.18)" : "rgba(109,40,217,0.10)",
      );
      fill.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = fill;
      ctx.fill();

      // Ground line + moving dashes
      const line = ctx.createLinearGradient(0, 0, W, 0);
      line.addColorStop(0, C.a);
      line.addColorStop(1, C.b);
      ctx.strokeStyle = line;
      ctx.lineWidth = Math.max(2, u * 0.004);
      glow(C.a, 16);
      ctx.beginPath();
      ctx.moveTo(0, ground);
      ctx.lineTo(W, ground);
      ctx.stroke();
      ctx.shadowBlur = 0;
      ctx.globalAlpha = 0.45;
      const spacing = u * 0.09;
      const shift = g.distance % spacing;
      for (let x = -shift; x < W; x += spacing) {
        ctx.fillStyle = line;
        ctx.fillRect(
          x,
          ground + u * 0.025,
          spacing * 0.35,
          Math.max(1, u * 0.003),
        );
        ctx.fillRect(
          x + spacing * 0.5,
          ground + u * 0.055,
          spacing * 0.15,
          Math.max(1, u * 0.003),
        );
      }
      ctx.globalAlpha = 1;

      // Obstacles
      for (const o of g.obstacles) {
        if (o.kind === "cactus") {
          const pw = o.w / o.cacti.length;
          o.cacti.forEach((h, i) =>
            drawCactus(o.x + i * pw, h, pw, o.seed + i),
          );
        } else {
          drawDino(o);
        }
      }
      ctx.shadowBlur = 0;

      if (g.phase !== "over") drawPlayer();
      ctx.shadowBlur = 0;

      // Sparks
      if (dark) ctx.globalCompositeOperation = "lighter";
      for (const s of g.sparks) {
        ctx.globalAlpha = Math.max(0, s.life);
        ctx.fillStyle = s.hue;
        ctx.beginPath();
        ctx.arc(
          s.x,
          s.y,
          Math.max(1, u * 0.005) * (0.5 + s.life),
          0,
          Math.PI * 2,
        );
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = "source-over";
    };

    // ---------------------------------------------------------- update
    const update = (dt: number) => {
      g.t += dt;

      for (const s of g.sparks) {
        s.x += s.vx * dt;
        s.y += s.vy * dt;
        s.vy += u * 1.2 * dt;
        s.life -= dt * 1.4;
      }
      g.sparks = g.sparks.filter((s) => s.life > 0);

      for (const s of g.stars) {
        s.x -= (g.phase === "running" ? g.speed : u * 0.08) * s.z * 0.05 * dt;
        if (s.x < 0) s.x += W;
      }

      if (g.phase !== "running") {
        // Idle: gentle bob while waiting to start.
        if (g.phase === "ready") g.py = Math.abs(Math.sin(g.t * 3)) * r * 0.25;
        return;
      }

      g.speed = Math.min(u * 1.4, g.speed + u * 0.013 * dt);
      g.distance += g.speed * dt;
      g.score = Math.floor(g.distance / (u * 0.08));

      if (g.score - g.lastMilestone >= MILESTONE) {
        g.lastMilestone = g.score - (g.score % MILESTONE);
        play("milestone");
        scoreRef.current?.animate(
          [
            { transform: "scale(1.35)", filter: "brightness(2)" },
            { transform: "scale(1)" },
          ],
          { duration: 500 },
        );
      }

      // Player physics
      g.ducking = (g.duckHeld || g.t < g.duckUntil) && g.py <= 0.5;
      const falling = (g.duckHeld || g.t < g.duckUntil) && g.py > 0;
      if (g.py > 0 || g.vy > 0) {
        g.vy -= u * 3.4 * (falling ? 2.6 : 1) * dt;
        g.py += g.vy * dt;
        if (g.py <= 0) {
          g.py = 0;
          g.vy = 0;
          burst(px, ground, 6, u * 0.2);
          // A press just before landing still counts.
          if (g.t - g.jumpBufferedAt < 0.12) {
            g.vy = u * 1.32;
            play("jump");
          }
        }
      }

      // Obstacles
      for (const o of g.obstacles) o.x -= g.speed * dt;
      g.obstacles = g.obstacles.filter((o) => o.x + o.w > -40);
      const last = g.obstacles[g.obstacles.length - 1];
      const minGap = g.speed * 0.85 + u * 0.12;
      if (!last || last.x + last.w < W - rand(minGap, minGap + g.speed * 0.9)) {
        spawn();
      }

      // Collision
      const pb = playerBox();
      for (const o of g.obstacles) {
        if (hitboxes(o).some((b) => overlaps(pb, b))) {
          burst(px, pb.y + pb.h / 2, 60, u * 0.9);
          play("crash");
          g.overAt = g.t;
          const newBest = Math.max(readBest(), g.score);
          writeBest(newBest);
          setBest(newBest);
          setFinalScore(g.score);
          setGamePhase("over");
          break;
        }
      }

      if (scoreRef.current) {
        scoreRef.current.textContent = String(g.score).padStart(5, "0");
      }
    };

    // ------------------------------------------------------------ loop
    let raf = 0;
    let last = performance.now();
    let visible = true;
    const frame = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      update(dt);
      draw();
      raf = requestAnimationFrame(frame);
    };
    const start = () => {
      if (raf || !visible) return;
      last = performance.now();
      raf = requestAnimationFrame(frame);
    };
    const stop = () => {
      cancelAnimationFrame(raf);
      raf = 0;
    };

    resize();
    reset();
    const ro = new ResizeObserver(resize);
    ro.observe(wrap);
    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) start();
      else stop();
    });
    io.observe(wrap);

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    wrap.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("pointerup", onPointerUp);
    start();

    return () => {
      stop();
      sfx.close();
      ro.disconnect();
      io.disconnect();
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      wrap.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointerup", onPointerUp);
    };
  }, [dark]);

  return (
    <div
      ref={wrapRef}
      role="application"
      aria-label="Light Runner. Press Space or tap to jump, down arrow or swipe down to duck, Escape to exit."
      className="absolute inset-0 z-10 touch-none select-none"
    >
      <canvas ref={canvasRef} className="h-full w-full" />

      <button
        type="button"
        onClick={toggleMute}
        aria-pressed={muted}
        aria-label={muted ? "Turn sound on" : "Turn sound off"}
        title="Sound (M)"
        className="absolute left-6 top-36 inline-flex size-9 items-center justify-center rounded-full border bg-background/60 text-muted-foreground backdrop-blur transition-colors hover:border-brand hover:text-foreground md:left-10"
      >
        {muted ? (
          <VolumeX className="size-4" />
        ) : (
          <Volume2 className="size-4" />
        )}
      </button>

      {/* HUD */}
      <div className="pointer-events-none absolute right-6 top-24 flex items-baseline gap-5 font-mono text-sm tabular-nums md:right-10">
        <span className="text-muted-foreground">
          BEST {String(best).padStart(5, "0")}
        </span>
        <span
          ref={scoreRef}
          className="inline-block font-display text-2xl font-bold text-foreground drop-shadow-[0_0_12px_hsl(var(--brand))]"
        >
          00000
        </span>
      </div>

      <button
        type="button"
        onClick={onExit}
        className="absolute left-6 top-24 inline-flex items-center gap-2 rounded-full border bg-background/60 px-3 py-1.5 text-xs font-medium text-muted-foreground backdrop-blur transition-colors hover:border-brand hover:text-foreground md:left-10"
      >
        <X className="size-3.5" />
        Exit game <kbd className="font-mono text-[10px] opacity-60">Esc</kbd>
      </button>

      {phase !== "running" ? (
        <div className="pointer-events-none absolute inset-x-0 top-[24%] flex flex-col items-center gap-3 px-6 text-center">
          {phase === "ready" ? (
            <>
              <p className="text-gradient font-display text-4xl font-bold tracking-tight md:text-6xl">
                Light Runner
              </p>
              <p className="text-sm text-muted-foreground md:text-base">
                Jump over the cacti, dodge the flying dinos.
              </p>
            </>
          ) : (
            <>
              <p className="font-display text-4xl font-bold tracking-tight md:text-6xl">
                Crashed
              </p>
              <p className="text-sm text-muted-foreground md:text-base">
                Score{" "}
                <span className="font-mono font-semibold text-foreground">
                  {finalScore}
                </span>
                {finalScore >= best && finalScore > 0 ? (
                  <span className="text-brand"> · new best!</span>
                ) : null}
              </p>
            </>
          )}
          <p className="mt-2 inline-flex flex-wrap items-center justify-center gap-x-4 gap-y-1 rounded-full border bg-background/60 px-4 py-2 text-xs text-muted-foreground backdrop-blur">
            <span>
              <kbd className="font-mono text-foreground">Space</kbd> / tap —{" "}
              {phase === "ready" ? "start & jump" : "try again"}
            </span>
            <span>
              <kbd className="font-mono text-foreground">↓</kbd> / swipe down —
              duck
            </span>
          </p>
        </div>
      ) : null}
    </div>
  );
}
