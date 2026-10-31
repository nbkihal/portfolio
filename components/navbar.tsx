"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import {
  FolderOpen,
  Mail,
  Menu,
  Route,
  Sparkles,
  User,
  X,
  type LucideIcon,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { hero, navLinks, site } from "@/content/site-data";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  LiquidNavbar,
  type LiquidNavItem,
  type NimbusFx,
} from "@/components/ui/liquid-glass-navbar";

/* Each nav link gets an icon and the little scene it plays when tapped. */
const SCENES: Record<string, { icon: LucideIcon; fx: NimbusFx }> = {
  "/#about": { icon: User, fx: "wave" },
  "/#parcours": { icon: Route, fx: "plane" },
  "/#services": { icon: Sparkles, fx: "spin" },
  "/#projects": { icon: FolderOpen, fx: "pop" },
  "/#contact": { icon: Mail, fx: "drop" },
};

const ITEMS: LiquidNavItem[] = navLinks.map((link) => {
  const scene = SCENES[link.href];
  const Icon = scene?.icon;
  return {
    label: link.label,
    href: link.href,
    icon: Icon ? <Icon size={18} strokeWidth={1.8} aria-hidden /> : undefined,
    fx: scene?.fx ?? "pop",
  };
});

/* "/#about" → "about": the section ids the links point at, in nav order. */
const SECTION_IDS = navLinks.map((link) => link.href.split("#")[1] ?? "");

/**
 * Which nav section is on screen, in nav order, or -1 for none (the hero,
 * or any page other than the home page). A section counts as current once
 * its top passes 40% of the viewport. After a click the result is pinned
 * for the duration of the smooth scroll, so the drop doesn't hop through
 * every section on the way.
 */
function useActiveSection(enabled: boolean) {
  const [active, setActive] = React.useState(-1);
  const pinnedUntil = React.useRef(0);

  React.useEffect(() => {
    if (!enabled) {
      setActive(-1);
      return;
    }
    let raf = 0;
    const measure = () => {
      raf = 0;
      if (performance.now() < pinnedUntil.current) return;
      const line = window.innerHeight * 0.4;
      let index = -1;
      SECTION_IDS.forEach((id, i) => {
        const el = id ? document.getElementById(id) : null;
        if (el && el.getBoundingClientRect().top <= line) index = i;
      });
      setActive(index);
    };
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(measure);
    };
    measure();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, [enabled]);

  const choose = React.useCallback((index: number) => {
    pinnedUntil.current = performance.now() + 1800;
    setActive(index);
  }, []);

  return [active, choose] as const;
}

function useMediaQuery(query: string) {
  const [matches, setMatches] = React.useState(false);
  React.useEffect(() => {
    const mql = window.matchMedia(query);
    const update = () => setMatches(mql.matches);
    update();
    mql.addEventListener("change", update);
    return () => mql.removeEventListener("change", update);
  }, [query]);
  return matches;
}

export function Navbar() {
  const [scrolled, setScrolled] = React.useState(false);
  const [open, setOpen] = React.useState(false);
  const pathname = usePathname();
  const [active, choose] = useActiveSection(pathname === "/");
  const roomy = useMediaQuery("(min-width: 1024px)");

  // The water is tinted for the background it sits on. Dark is the site
  // default, so render that on the server and settle after mount.
  const { resolvedTheme } = useTheme();
  const [tone, setTone] = React.useState<"light" | "dark">("dark");
  React.useEffect(() => {
    if (resolvedTheme) setTone(resolvedTheme === "dark" ? "dark" : "light");
  }, [resolvedTheme]);

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Lock body scroll while the mobile menu is open.
  React.useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-300",
        scrolled
          ? "border-b border-border/60 bg-background/80 backdrop-blur-lg"
          : "border-b border-transparent bg-transparent",
      )}
    >
      <div className="container relative flex h-16 items-center justify-between">
        <Link
          href="/"
          className="font-display text-lg font-bold tracking-tight"
          onClick={() => setOpen(false)}
        >
          {site.name}
          <span className="text-brand">.</span>
        </Link>

        {/* Desktop links: a pill of water, centred. Icons only until there is room for labels. */}
        <div className="absolute left-1/2 top-1/2 hidden -translate-x-1/2 -translate-y-1/2 md:block">
          <LiquidNavbar
            items={ITEMS}
            active={active}
            onChange={choose}
            tone={tone}
            compact={!roomy}
            frame={false}
            style={{ fontFamily: "inherit" }}
          />
        </div>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Button asChild size="sm" className="hidden sm:inline-flex">
            <Link href={hero.primaryCta.href}>{hero.primaryCta.label}</Link>
          </Button>
          {/* Mobile menu toggle */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile menu */}
      {open ? (
        <nav
          aria-label="Main"
          className="border-t border-border/60 bg-background/95 backdrop-blur-lg md:hidden"
        >
          <div className="container flex flex-col gap-1 py-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="rounded-md px-3 py-3 text-base font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              >
                {link.label}
              </Link>
            ))}
            <Button asChild className="mt-2">
              <Link href={hero.primaryCta.href} onClick={() => setOpen(false)}>
                {hero.primaryCta.label}
              </Link>
            </Button>
          </div>
        </nav>
      ) : null}
    </header>
  );
}
