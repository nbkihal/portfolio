import type { CSSProperties } from "react";

import { brandColor, iconForTech } from "@/lib/tech-icons";

/**
 * Visual for projects without screenshots or code: the project's tech
 * logos as lit tiles on a dotted grid, each glowing in its brand colour
 * when the card is hovered.
 */
export function TechHeader({ tech }: { tech: string[] }) {
  const items = tech
    .map((name) => ({ name, icon: iconForTech(name) }))
    .filter((t) => t.icon);

  return (
    <div className="bg-dotted relative flex h-full items-center justify-center gap-4 px-6">
      {items.map(({ name, icon }, i) => (
        <span
          key={name}
          title={name}
          className="flex size-16 items-center justify-center rounded-2xl border bg-background/70 text-muted-foreground/70 shadow-lg backdrop-blur transition-all duration-500 group-hover:-translate-y-1.5 group-hover:text-[color:var(--tech)] group-hover:shadow-[0_0_30px_-6px_var(--tech)]"
          style={
            {
              "--tech": brandColor(icon!),
              transitionDelay: `${i * 60}ms`,
            } as CSSProperties
          }
        >
          <svg aria-hidden viewBox="0 0 24 24" className="size-8 fill-current">
            <path d={icon!.path} />
          </svg>
        </span>
      ))}
    </div>
  );
}
