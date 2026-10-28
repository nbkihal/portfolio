"use client";

import { motion, useReducedMotion } from "framer-motion";

/**
 * Two large blurred lights (violet + cyan) drifting slowly behind a
 * section. Place inside a `relative overflow-hidden` parent, before the
 * content, and give the content `relative` so it paints on top.
 */
export function AmbientLights() {
  const reduceMotion = useReducedMotion();

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0">
      <motion.div
        className="absolute left-[5%] top-[20%] size-[26rem] rounded-full bg-brand/20 blur-[110px] dark:bg-brand/25"
        animate={
          reduceMotion ? undefined : { x: [0, 120, -40, 0], y: [0, -60, 80, 0] }
        }
        transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-[5%] right-[5%] size-[22rem] rounded-full bg-cyan/15 blur-[110px] dark:bg-cyan/20"
        animate={
          reduceMotion ? undefined : { x: [0, -100, 60, 0], y: [0, 60, -50, 0] }
        }
        transition={{ duration: 26, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
}
