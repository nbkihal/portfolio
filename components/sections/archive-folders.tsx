"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { ArrowLeft, ArrowRight } from "lucide-react";

import { projects, type ProjectCategory } from "@/content/site-data";
import { Section, SectionHeading } from "@/components/section";
import { Reveal } from "@/components/reveal";
import { AmbientLights } from "@/components/ambient-lights";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import GlassFolder, {
  type ArtRecipe,
  type FolderFile,
} from "@/components/ui/glass-folder-cards";

/**
 * The Work section: every project, sorted into folders — one per category.
 * Each file in a folder is a real project: its first screenshot on the sheet,
 * a link to its case study on click. The folder menu opens the archive
 * pre-filtered; the button below it opens the whole archive.
 */

const CATEGORIES: ProjectCategory[] = [
  "Web",
  "Mobile",
  "AI",
  "Games",
  "Client & pro",
];

/* Brand violet + cyan, in five moods — one per folder, so each is recognisable at a glance. */
const ART: Record<ProjectCategory, ArtRecipe> = {
  Web: {
    style: "marble",
    colors: ["#0b0716", "#2a1750", "#7c3aed", "#1a1033", "#0ea5c9", "#a78bfa", "#ede9fe"],
    scale: 0.68,
    warp: 3.2,
    angle: -0.5,
    gloss: 0.5,
    veins: 0.45,
  },
  Mobile: {
    style: "streak",
    colors: ["#f5f3ff", "#c4b5fd", "#7c3aed", "#1e1b4b", "#0891b2", "#67e8f9", "#ecfeff"],
    scale: 0.7,
    warp: 1.5,
    angle: -0.62,
    gloss: 0.2,
    veins: 0,
  },
  AI: {
    style: "marble",
    colors: ["#07090c", "#111a2e", "#22d3ee", "#0f0a1e", "#6d28d9", "#c084fc", "#f5d0fe"],
    scale: 0.62,
    warp: 3.6,
    angle: 0.8,
    gloss: 0.55,
    veins: 0.6,
  },
  Games: {
    style: "marble",
    colors: ["#120c18", "#4c1d95", "#f472b6", "#2b1a24", "#fb923c", "#fde68a", "#fff7ed"],
    scale: 0.75,
    warp: 3.4,
    angle: 2.1,
    gloss: 0.5,
    veins: 0.5,
  },
  "Client & pro": {
    style: "streak",
    colors: ["#f8fafc", "#cbd5e1", "#64748b", "#1e1b4b", "#7c3aed", "#a5b4fc", "#eef2ff"],
    scale: 0.7,
    warp: 1.6,
    angle: 0.35,
    gloss: 0.25,
    veins: 0,
  },
};

const FOLDER_WIDTH = 300;
const SHELF_GAP = 40;
const SHELF_ARROW =
  "inline-flex size-10 items-center justify-center rounded-full border border-border bg-background/60 text-foreground backdrop-blur transition-colors hover:border-brand hover:text-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand disabled:pointer-events-none disabled:opacity-30";

const SEEDS: Record<ProjectCategory, number> = {
  Web: 3,
  Mobile: 7,
  AI: 11,
  Games: 5,
  "Client & pro": 9,
};

/** "Staff Pro v2 — HR Attendance SaaS" → "Staff Pro v2": the sheet is narrow. */
const shortTitle = (title: string) => title.split(/\s[—–-]\s/)[0];

function filesFor(category: ProjectCategory): FolderFile[] {
  return (
    projects
      .filter((p) => p.categories.includes(category))
      .map<FolderFile>((p) => {
        const shot = p.shots?.find((s) => s.device === "laptop") ?? p.shots?.[0];
        return {
          name: shortTitle(p.title),
          meta: p.tech[0],
          image: shot?.src,
          href: `/projects/${p.id}`,
        };
      })
      // the folder draws its last file nearest the glass, so the lead project goes last
      .reverse()
  );
}

export function ArchiveFolders() {
  const router = useRouter();
  const { resolvedTheme } = useTheme();
  // dark is the site default, so render that on the server and settle after mount
  const [tone, setTone] = React.useState<"light" | "dark">("dark");
  React.useEffect(() => {
    if (resolvedTheme) setTone(resolvedTheme === "dark" ? "dark" : "light");
  }, [resolvedTheme]);

  const folders = CATEGORIES.map((category) => ({
    category,
    files: filesFor(category),
  })).filter((f) => f.files.length > 0);

  // ---- the shelf: a horizontal scroller --------------------------------------
  // Three ways to move it besides a trackpad swipe: the arrows, a vertical
  // mouse wheel over it (which turns sideways until the shelf runs out, then
  // the page scrolls on as usual), and dragging it with the mouse.
  const shelfRef = React.useRef<HTMLDivElement>(null);
  const [edge, setEdge] = React.useState({ start: true, end: false });
  React.useEffect(() => {
    const el = shelfRef.current;
    if (!el) return;
    const measure = () => {
      const max = el.scrollWidth - el.clientWidth;
      setEdge({ start: el.scrollLeft <= 2, end: el.scrollLeft >= max - 2 });
    };
    measure();
    el.addEventListener("scroll", measure, { passive: true });
    const ro = new ResizeObserver(measure);
    ro.observe(el);

    // Vertical wheel → sideways. Handled here, before the event reaches the
    // window, so Lenis never sees the ones the shelf consumes.
    const onWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaX) >= Math.abs(e.deltaY)) return; // already sideways
      const max = el.scrollWidth - el.clientWidth;
      const room = e.deltaY > 0 ? el.scrollLeft < max - 1 : el.scrollLeft > 1;
      if (!room) return; // let the page take over at either end
      e.preventDefault();
      e.stopPropagation();
      el.scrollLeft += e.deltaY;
    };
    el.addEventListener("wheel", onWheel, { passive: false });

    // Drag to scroll. A press that moves more than a few px becomes a drag
    // and the click it would have been is swallowed, so a folder doesn't
    // open at the end of a drag.
    let drag: { x: number; left: number; moved: boolean } | null = null;
    const onDown = (e: PointerEvent) => {
      if (e.pointerType !== "mouse" || e.button !== 0) return;
      drag = { x: e.clientX, left: el.scrollLeft, moved: false };
    };
    const onMove = (e: PointerEvent) => {
      if (!drag) return;
      const dx = e.clientX - drag.x;
      if (!drag.moved) {
        if (Math.abs(dx) < 6) return;
        drag.moved = true;
        el.setPointerCapture(e.pointerId);
        el.dataset.dragging = "true";
      }
      el.scrollLeft = drag.left - dx;
    };
    const onUp = (e: PointerEvent) => {
      if (!drag) return;
      if (drag.moved) {
        el.releasePointerCapture(e.pointerId);
        // let the click that follows this release be swallowed, then clear
        setTimeout(() => delete el.dataset.dragging, 0);
      }
      drag = null;
    };
    const onClick = (e: MouseEvent) => {
      if (el.dataset.dragging) {
        e.preventDefault();
        e.stopPropagation();
      }
    };
    el.addEventListener("pointerdown", onDown);
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerup", onUp);
    el.addEventListener("pointercancel", onUp);
    el.addEventListener("click", onClick, true);

    return () => {
      el.removeEventListener("scroll", measure);
      ro.disconnect();
      el.removeEventListener("wheel", onWheel);
      el.removeEventListener("pointerdown", onDown);
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerup", onUp);
      el.removeEventListener("pointercancel", onUp);
      el.removeEventListener("click", onClick, true);
    };
  }, []);
  // The arrows go to the next folder position outright, so quick repeated
  // presses don't drift off the grid.
  const shelfBy = (dir: -1 | 1) => {
    const el = shelfRef.current;
    if (!el) return;
    const step = FOLDER_WIDTH + SHELF_GAP;
    const at = Math.round(el.scrollLeft / step);
    el.scrollTo({ left: (at + dir) * step, behavior: "smooth" });
  };

  return (
    <Section id="projects" className="relative overflow-hidden">
      <AmbientLights />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 text-foreground opacity-[0.07]"
        style={{
          backgroundImage: "radial-gradient(currentColor 1.1px, transparent 1.4px)",
          backgroundSize: "22px 22px",
        }}
      />

      <div className="container relative">
        <SectionHeading
          eyebrow="Selected Work"
          title="Things I've shipped"
          description="Client work, team products and experiments, filed by type. Open a folder and pick a file for the full story — problem, build, and outcome."
        />

        <div className="relative z-10 -mt-6 mb-2 flex items-center justify-end gap-2">
          <button
            type="button"
            aria-label="Scroll folders left"
            disabled={edge.start}
            onClick={() => shelfBy(-1)}
            className={SHELF_ARROW}
          >
            <ArrowLeft className="size-4" />
          </button>
          <button
            type="button"
            aria-label="Scroll folders right"
            disabled={edge.end}
            onClick={() => shelfBy(1)}
            className={SHELF_ARROW}
          >
            <ArrowRight className="size-4" />
          </button>
        </div>

      </div>

      {/*
        Full-bleed: the shelf runs edge to edge, outside the container, with
        padding that mirrors the container's (1.5rem inside a 1200px cap) so
        the first folder lines up with the heading. The scroller
        clips vertically too, so it carries enough headroom for an open
        folder's files to rise into, and sits in a fading mask so folders
        slide in from the edges instead of being cut off.
      */}
      <div
        ref={shelfRef}
        role="list"
        aria-label="Projects by category"
        className={cn(
          "relative flex items-end overflow-x-auto overscroll-x-contain select-none",
          "px-[max(1.5rem,calc((100%-1200px)/2+1.5rem))]",
          "-mt-28 pb-16 pt-32",
          "[scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
          "[mask-image:linear-gradient(to_right,transparent,black_1.5rem,black_calc(100%-1.5rem),transparent)]",
        )}
        style={{ gap: SHELF_GAP }}
      >
        {folders.map(({ category, files }, i) => (
          <div key={category} role="listitem">
            <GlassFolder
              label={category}
              meta={`${files.length} ${files.length === 1 ? "project" : "projects"}`}
              tone={tone}
              art={ART[category]}
              seed={SEEDS[category]}
              files={files}
              action="more"
              width={FOLDER_WIDTH}
              appearDelay={i * 120}
              labelPlacement={i % 2 ? "top-left" : "bottom-left"}
              menu={[
                {
                  label: `See all ${category}`,
                  onSelect: () =>
                    router.push(`/projects#${encodeURIComponent(category)}`),
                },
              ]}
            />
          </div>
        ))}
      </div>

      <div className="container relative">
        <p className="mt-2 text-center font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
          Scroll sideways · Hover to lean · Click to open · Pick a file to read the case study
        </p>

        <Reveal delay={0.1} className="mt-10 flex flex-col items-center gap-3">
          <Button
            asChild
            size="lg"
            variant="outline"
            className="group rounded-full border-brand/40 px-8 hover:border-brand hover:shadow-[0_0_30px_-6px_hsl(var(--brand)/0.7)]"
          >
            <Link href="/projects">
              See all {projects.length} projects
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </Button>
          <p className="text-sm text-muted-foreground">
            The full archive, with filters
          </p>
        </Reveal>
      </div>
    </Section>
  );
}
