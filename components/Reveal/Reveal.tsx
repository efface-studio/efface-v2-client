"use client";

import { motion, useReducedMotion } from "motion/react";
import { fadeUp } from "@/lib/motion";
import type { RevealProps } from "./Reveal.types";

/**
 * Fades + lifts its children into view once, when scrolled into the viewport.
 * Server-rendered children are passed straight through, so sections stay RSC.
 */
export default function Reveal({ children, delay = 0, y = 20, className }: RevealProps) {
  const reduce = useReducedMotion();

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
