import type { CSSProperties } from "react";

import { techStack } from "@/content/site-data";
import { techIcons, type TechName } from "@/lib/tech-icons";

/**
 * Infinite, gray strip of tech logos. Each logo lights up in its brand
 * colour on hover, and the strip pauses while hovered. Logos whose brand
 * colour is near-black (Next.js, GitHub…) light up in the text colour
 * instead, so they stay visible in dark mode.
 */
export function TechMarquee() {
  return (
    <section
      aria-label="Technologies I work with"
      className="relative border-y border-border/60 bg-muted/20 py-10"
    >
      <p className="mb-8 text-center text-xs font-medium uppercase tracking-[0.25em] text-muted-foreground">
        Technologies I work with
      </p>

      <div className="group/marquee relative overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_12%,black_88%,transparent)]">
        <div className="animate-marquee flex w-max group-hover/marquee:[animation-play-state:paused]">
          <TechList />
          <TechList hidden />
        </div>
      </div>
    </section>
  );
}

/** One full copy of the list; the strip renders two for a seamless loop. */
function TechList({ hidden = false }: { hidden?: boolean }) {
  return (
    <ul aria-hidden={hidden || undefined} className="flex shrink-0">
      {techStack.map((name) => (
        <TechItem key={name} name={name} />
      ))}
    </ul>
  );
}

function TechItem({ name }: { name: TechName }) {
  const icon = techIcons[name];
  const hover = isDark(icon.hex) ? "hsl(var(--foreground))" : `#${icon.hex}`;

  return (
    <li
      className="group flex items-center gap-3 px-7 text-muted-foreground/70 transition-colors duration-300 hover:text-[color:var(--tech)]"
      style={{ "--tech": hover } as CSSProperties}
    >
      <svg
        aria-hidden
        viewBox="0 0 24 24"
        className="size-8 fill-current transition-[transform,filter] duration-300 group-hover:scale-110 group-hover:drop-shadow-[0_0_12px_var(--tech)]"
      >
        <path d={icon.path} />
      </svg>
      <span className="whitespace-nowrap font-display text-sm font-medium transition-colors group-hover:text-foreground">
        {name}
      </span>
    </li>
  );
}

/** True for brand colours too dark to show on the dark theme. */
function isDark(hex: string) {
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(hex.slice(i, i + 2), 16));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b < 60;
}
