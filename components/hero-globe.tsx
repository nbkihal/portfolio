"use client";

import * as React from "react";
import dynamic from "next/dynamic";

// Code-split the 3D scene and never render it on the server (three.js is
// client-only). The hero renders instantly; the globe hydrates after.
const GlobeCanvas = dynamic(() => import("@/components/globe-canvas"), {
  ssr: false,
  loading: () => null,
});

/** Swallows WebGL/three.js runtime errors so the hero never crashes. */
class GlobeErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  render() {
    if (this.state.hasError) return null;
    return this.props.children;
  }
}

export function HeroGlobe() {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [active, setActive] = React.useState(false);

  // Pause the render loop whenever the hero scrolls out of view.
  React.useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => setActive(entry.isIntersecting),
      { threshold: 0.05 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 -z-10"
    >
      {/* Soft glow behind the globe */}
      <div className="absolute left-1/2 top-1/2 h-[70vmin] w-[70vmin] -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand/20 blur-[120px]" />
      <GlobeErrorBoundary>
        <GlobeCanvas active={active} />
      </GlobeErrorBoundary>
    </div>
  );
}
