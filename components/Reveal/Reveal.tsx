"use client";

import { useCallback, useRef } from "react";
import { motion, useReducedMotion } from "motion/react";
import { fadeUp } from "@/lib/motion";
import { elementProgress, useScrollMotion } from "@/lib/scrollMotion";
import { useIsMobile } from "@/lib/useIsMobile";
import type { RevealProps } from "./Reveal.types";

/** How far (%) the soft edge of the phone wipe trails behind its front. */
const ERASE_SOFT = 28;

/**
 * Desktop: fades + lifts its children into view once, when scrolled into the
 * viewport. Phones: the content is rubbed into view instead — a soft-edged mask
 * sweeps across it as it scrolls up, the studio's "erase" motif played in
 * reverse. Server-rendered children are passed straight through, so sections
 * stay RSC.
 */
export default function Reveal({ children, delay = 0, y = 20, className }: RevealProps) {
  const reduce = useReducedMotion();
  const isMobile = useIsMobile();
  const ref = useRef<HTMLDivElement>(null);

  const frame = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    const p = elementProgress(el, 0.96, 0.38);
    el.style.setProperty("--erase", `${(-ERASE_SOFT + p * (100 + ERASE_SOFT * 2)).toFixed(1)}%`);
  }, []);
  useScrollMotion(ref, frame, isMobile && !reduce);

  if (isMobile && !reduce) {
    return (
      <div
        ref={ref}
        className={className}
        style={{
          ["--erase" as string]: `-${ERASE_SOFT}%`,
          maskImage: `linear-gradient(100deg, #000 calc(var(--erase) - ${ERASE_SOFT}%), transparent var(--erase))`,
          WebkitMaskImage: `linear-gradient(100deg, #000 calc(var(--erase) - ${ERASE_SOFT}%), transparent var(--erase))`,
        }}
      >
        {children}
      </div>
    );
  }

  return (
    <motion.div
      className={className}
      variants={fadeUp(y, delay)}
      initial={reduce ? false : "hidden"}
      whileInView="visible"
      viewport={{ once: true, margin: "-80px" }}
    >
      {children}
    </motion.div>
  );
}
