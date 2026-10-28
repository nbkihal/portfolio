import Image from "next/image";

import { cn } from "@/lib/utils";

interface MockupProps {
  src: string;
  alt: string;
  /** `sizes` hint for next/image — how wide the device renders. */
  sizes: string;
  className?: string;
  priority?: boolean;
}

/** Laptop frame: bezel with camera, 16:10 screen, and a keyboard deck. */
export function LaptopMockup({
  src,
  alt,
  sizes,
  className,
  priority,
}: MockupProps) {
  return (
    <div className={cn("relative", className)}>
      <div className="relative rounded-t-[4.5%_7%] border border-white/10 bg-neutral-900 p-[2.2%] pb-[3%] shadow-[0_30px_60px_-20px_rgba(0,0,0,0.6)]">
        <span className="absolute left-1/2 top-[0.9%] size-[0.9%] min-h-1 min-w-1 -translate-x-1/2 rounded-full bg-neutral-700" />
        <div className="relative aspect-[16/10] overflow-hidden rounded-[0.6%] bg-neutral-800">
          <Image
            src={src}
            alt={alt}
            fill
            sizes={sizes}
            priority={priority}
            className="object-cover object-top"
          />
          {/* Screen glare */}
          <span className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/[0.08] via-transparent to-transparent" />
        </div>
      </div>
      {/* Keyboard deck */}
      <div className="relative left-1/2 h-[3.2%] min-h-2 w-[114%] -translate-x-1/2 rounded-b-[50%_100%] bg-gradient-to-b from-neutral-300 to-neutral-500 shadow-[0_18px_30px_-12px_rgba(0,0,0,0.6)] dark:from-neutral-500 dark:to-neutral-700">
        <span className="absolute left-1/2 top-0 h-[45%] w-[16%] -translate-x-1/2 rounded-b-md bg-neutral-400 dark:bg-neutral-600" />
      </div>
    </div>
  );
}

/** Phone frame: rounded body, dynamic island and side buttons. */
export function PhoneMockup({
  src,
  alt,
  sizes,
  className,
  priority,
}: MockupProps) {
  return (
    <div className={cn("relative", className)}>
      {/* Side buttons */}
      <span className="absolute -left-[1.5%] top-[18%] h-[7%] w-[1.5%] rounded-l-sm bg-neutral-700" />
      <span className="absolute -left-[1.5%] top-[27%] h-[11%] w-[1.5%] rounded-l-sm bg-neutral-700" />
      <span className="absolute -right-[1.5%] top-[24%] h-[14%] w-[1.5%] rounded-r-sm bg-neutral-700" />

      <div className="relative rounded-[14%/6.5%] border border-white/10 bg-neutral-900 p-[3.5%] shadow-[0_30px_60px_-18px_rgba(0,0,0,0.65)]">
        <div className="relative aspect-[390/844] overflow-hidden rounded-[11%/5%] bg-neutral-800">
          <Image
            src={src}
            alt={alt}
            fill
            sizes={sizes}
            priority={priority}
            className="object-cover object-top"
          />
          {/* Dynamic island */}
          <span className="absolute left-1/2 top-[1.6%] h-[3.4%] w-[30%] -translate-x-1/2 rounded-full bg-neutral-950" />
          <span className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/[0.1] via-transparent to-transparent" />
        </div>
      </div>
    </div>
  );
}
