import type { ProjectShot } from "@/content/site-data";
import { cn } from "@/lib/utils";
import { LaptopMockup, PhoneMockup } from "@/components/device-mockups";

interface ProjectShowcaseProps {
  shots: ProjectShot[];
  /** "card" for project cards, "hero" for the big one on a project page. */
  size?: "card" | "hero";
  className?: string;
}

/**
 * Arranges a project's screenshots into a device composition:
 * - laptop + phone → the phone leans in front of the laptop's corner
 * - phones only    → up to three phones fanned out
 * - laptop only    → a single laptop
 * Devices shift apart slightly when the surrounding `group` is hovered.
 */
export function ProjectShowcase({
  shots,
  size = "card",
  className,
}: ProjectShowcaseProps) {
  const hero = size === "hero";
  const laptop = shots.find((s) => s.device === "laptop");
  const phones = shots.filter((s) => s.device === "phone").slice(0, 3);
  const laptopSizes = hero
    ? "(min-width: 1024px) 760px, 90vw"
    : "(min-width: 1024px) 420px, 80vw";
  const phoneSizes = hero
    ? "(min-width: 1024px) 240px, 30vw"
    : "(min-width: 1024px) 140px, 30vw";

  return (
    <div className={cn("relative", className)}>
      {/* Light pooling under the devices */}
      <div
        aria-hidden
        className="absolute inset-x-[10%] bottom-0 top-[20%] rounded-full bg-gradient-to-r from-brand/30 to-cyan/25 blur-3xl"
      />

      {laptop && phones[0] ? (
        <div className="relative pb-[6%] pr-[14%]">
          <LaptopMockup
            src={laptop.src}
            alt={laptop.alt}
            sizes={laptopSizes}
            priority={hero}
            className="transition-transform duration-500 group-hover:-translate-y-1"
          />
          <PhoneMockup
            src={phones[0].src}
            alt={phones[0].alt}
            sizes={phoneSizes}
            priority={hero}
            className="absolute bottom-0 right-0 w-[27%] rotate-[4deg] transition-transform duration-500 group-hover:-translate-y-3 group-hover:rotate-[1deg]"
          />
        </div>
      ) : phones.length ? (
        <div className="relative flex items-end justify-center">
          {phones.map((shot, i) => {
            const position =
              phones.length === 1
                ? "center"
                : i === 0
                  ? "center"
                  : i === 1
                    ? "left"
                    : "right";
            return (
              <PhoneMockup
                key={shot.src}
                src={shot.src}
                alt={shot.alt}
                sizes={phoneSizes}
                priority={hero && i === 0}
                className={cn(
                  "w-[34%] shrink-0 transition-transform duration-500",
                  position === "center" && "z-10",
                  position === "left" &&
                    "order-first -mr-[10%] translate-y-[6%] -rotate-[9deg] scale-90 group-hover:-translate-x-[6%] group-hover:-rotate-[12deg]",
                  position === "right" &&
                    "-ml-[10%] translate-y-[6%] rotate-[9deg] scale-90 group-hover:translate-x-[6%] group-hover:rotate-[12deg]",
                  position === "center" && "group-hover:-translate-y-2",
                )}
              />
            );
          })}
        </div>
      ) : laptop ? (
        <LaptopMockup
          src={laptop.src}
          alt={laptop.alt}
          sizes={laptopSizes}
          priority={hero}
          className="relative mx-auto w-[92%] transition-transform duration-500 group-hover:-translate-y-1"
        />
      ) : null}
    </div>
  );
}
