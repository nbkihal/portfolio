"use client";

import * as React from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

import type { ProjectShot } from "@/content/site-data";
import { cn } from "@/lib/utils";
import { LaptopMockup, PhoneMockup } from "@/components/device-mockups";

/**
 * Every screenshot of a project in its device frame — phones in a row,
 * laptops in a grid. Clicking one opens it full size; arrow keys browse
 * and Escape closes.
 */
export function ShotGallery({ shots }: { shots: ProjectShot[] }) {
  const [open, setOpen] = React.useState<number | null>(null);
  const phones = shots.filter((s) => s.device === "phone");
  const laptops = shots.filter((s) => s.device === "laptop");
  // Lightbox order follows the on-screen order: laptops, then phones.
  const ordered = [...laptops, ...phones];

  const step = React.useCallback(
    (delta: number) =>
      setOpen((i) =>
        i === null ? i : (i + delta + ordered.length) % ordered.length,
      ),
    [ordered.length],
  );

  React.useEffect(() => {
    if (open === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(null);
      if (e.key === "ArrowRight") step(1);
      if (e.key === "ArrowLeft") step(-1);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, step]);

  const current = open === null ? null : ordered[open];

  return (
    <>
      {laptops.length ? (
        <div
          className={cn(
            "grid gap-x-8 gap-y-12",
            laptops.length > 1 && "md:grid-cols-2",
          )}
        >
          {laptops.map((shot, i) => (
            <ShotButton
              key={shot.src}
              shot={shot}
              onOpen={() => setOpen(i)}
              className={cn(
                laptops.length === 1 && "mx-auto max-w-3xl",
                laptops.length === 3 &&
                  i === 0 &&
                  "md:col-span-2 md:mx-auto md:w-3/4",
              )}
            />
          ))}
        </div>
      ) : null}

      {phones.length ? (
        <div
          className={cn(
            "mx-auto grid max-w-4xl grid-cols-2 gap-6 sm:gap-10",
            phones.length >= 3 && "sm:grid-cols-3",
            phones.length >= 4 && "lg:grid-cols-4",
            laptops.length > 0 && "mt-14",
          )}
        >
          {phones.map((shot, i) => (
            <ShotButton
              key={shot.src}
              shot={shot}
              onOpen={() => setOpen(laptops.length + i)}
            />
          ))}
        </div>
      ) : null}

      <AnimatePresence>
        {current ? (
          <motion.div
            key="lightbox"
            role="dialog"
            aria-modal="true"
            aria-label={current.alt}
            className="fixed inset-0 z-[70] flex items-center justify-center bg-background/85 p-4 backdrop-blur-md sm:p-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(null)}
          >
            <motion.div
              key={current.src}
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.94 }}
              transition={{ duration: 0.25 }}
              onClick={(e) => e.stopPropagation()}
              className={cn(
                "relative w-full",
                current.device === "phone"
                  ? "max-w-[min(22rem,calc((100svh-8rem)*0.46))]"
                  : "max-w-[min(72rem,calc((100svh-8rem)*1.6))]",
              )}
            >
              <div
                className={cn(
                  "relative overflow-hidden rounded-xl border bg-card shadow-2xl",
                  current.device === "phone"
                    ? "aspect-[390/844]"
                    : "aspect-[16/10]",
                )}
              >
                <Image
                  src={current.src}
                  alt={current.alt}
                  fill
                  sizes="(min-width: 1024px) 72rem, 95vw"
                  className="object-contain"
                />
              </div>
              <p className="mt-3 text-center text-sm text-muted-foreground">
                {current.alt}
              </p>
            </motion.div>

            <LightboxButton
              label="Close"
              className="right-4 top-4"
              onClick={() => setOpen(null)}
            >
              <X className="size-5" />
            </LightboxButton>
            {ordered.length > 1 ? (
              <>
                <LightboxButton
                  label="Previous screenshot"
                  className="left-2 top-1/2 -translate-y-1/2 sm:left-6"
                  onClick={() => step(-1)}
                >
                  <ChevronLeft className="size-5" />
                </LightboxButton>
                <LightboxButton
                  label="Next screenshot"
                  className="right-2 top-1/2 -translate-y-1/2 sm:right-6"
                  onClick={() => step(1)}
                >
                  <ChevronRight className="size-5" />
                </LightboxButton>
              </>
            ) : null}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}

function ShotButton({
  shot,
  onOpen,
  className,
}: {
  shot: ProjectShot;
  onOpen: () => void;
  className?: string;
}) {
  const Mockup = shot.device === "phone" ? PhoneMockup : LaptopMockup;
  return (
    <button
      type="button"
      onClick={onOpen}
      aria-label={`Open screenshot: ${shot.alt}`}
      className={cn(
        "group relative block w-full rounded-2xl text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-4 focus-visible:ring-offset-background",
        className,
      )}
    >
      <span
        aria-hidden
        className="absolute inset-[15%] rounded-full bg-brand/25 opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-100"
      />
      <Mockup
        src={shot.src}
        alt={shot.alt}
        sizes={
          shot.device === "phone"
            ? "(min-width: 1024px) 220px, 45vw"
            : "(min-width: 768px) 45vw, 90vw"
        }
        className="transition-transform duration-500 group-hover:-translate-y-2"
      />
      <span className="mt-4 block text-center text-sm text-muted-foreground transition-colors group-hover:text-foreground">
        {shot.alt}
      </span>
    </button>
  );
}

function LightboxButton({
  label,
  className,
  onClick,
  children,
}: {
  label: string;
  className?: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      className={cn(
        "absolute inline-flex size-11 items-center justify-center rounded-full border bg-background/80 text-foreground backdrop-blur transition-colors hover:border-brand hover:text-brand",
        className,
      )}
    >
      {children}
    </button>
  );
}
