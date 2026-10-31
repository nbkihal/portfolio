"use client";

import * as React from "react";
import Lenis from "lenis";

/** Gentle ease-in-out used for anchor jumps (nav links, CTAs). */
const easeInOutCubic = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

/**
 * Smooth, slightly slowed-down page scrolling (Lenis). Wheel input is
 * eased toward its target instead of jumping, and same-page anchor links
 * glide to their section. Touch keeps native scrolling, and Lenis turns
 * smoothing off for users who prefer reduced motion.
 */
export function SmoothScroll() {
  React.useEffect(() => {
    const lenis = new Lenis({
      // Lower lerp = longer, softer glide (default 0.1).
      lerp: 0.07,
      // Slightly less distance per wheel notch, so it feels slower.
      wheelMultiplier: 0.85,
      autoRaf: true,
      // Let modals / inner scroll areas scroll on their own.
      allowNestedScroll: true,
      // Pause while a menu or lightbox has locked the page.
      virtualScroll: () => document.body.style.overflow !== "hidden",
    });

    // Same-page hash links: glide there instead of jumping. Runs in the
    // capture phase and prevents the default, which Next's <Link> respects
    // (its own onClick props still run, so menus still close).
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0) return;
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const anchor = (e.target as Element | null)?.closest?.("a[href]");
      if (!(anchor instanceof HTMLAnchorElement) || anchor.target) return;

      const url = new URL(anchor.href);
      if (
        !url.hash ||
        url.origin !== window.location.origin ||
        url.pathname !== window.location.pathname
      ) {
        return;
      }
      const target = document.getElementById(
        decodeURIComponent(url.hash.slice(1)),
      );
      if (!target) return;

      e.preventDefault();
      lenis.scrollTo(target, { duration: 1.6, easing: easeInOutCubic });
      if (window.location.hash !== url.hash) {
        window.history.pushState(null, "", url.hash);
      }
    };

    window.addEventListener("click", onClick, true);
    return () => {
      window.removeEventListener("click", onClick, true);
      lenis.destroy();
    };
  }, []);

  return null;
}
