import type { Variants } from "motion/react";

/* ── Easing ──────────────────────────────────────────────────────
   One curve carries every entrance and transition in the app. The symmetric
   sweep used by link underlines is CSS-only, so it stays in `globals.css`. */
export const EASE_OUT_EXPO = [0.22, 1, 0.36, 1] as const;

/** Seconds. Anything animated picks one of these rather than a literal. */
export const DURATION = {
  /** overlay fades, micro-interactions */
  fast: 0.4,
  /** menu items, medium transitions */
  base: 0.6,
  /** section reveals */
  slow: 0.7,
} as const;

/** Delay added per item in a staggered list. */
export const STAGGER = {
  tight: 0.06,
  base: 0.07,
} as const;

/* ── Framer Motion variants ──────────────────────────────────────── */

/** Rise + fade, used by `Reveal` for every section entrance. */
export const fadeUp = (y = 20, delay = 0): Variants => ({
  hidden: { opacity: 0, y },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: DURATION.slow, delay, ease: EASE_OUT_EXPO },
  },
});

/** Full-screen overlay backdrop. */
export const overlayFade: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: DURATION.fast, ease: EASE_OUT_EXPO },
  },
  exit: { opacity: 0, transition: { duration: DURATION.fast, ease: EASE_OUT_EXPO } },
};

/** Menu row wiping up out of its own clipped box, staggered by index. */
export const menuItem = (index: number): Variants => ({
  hidden: { y: "100%", opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      duration: DURATION.base,
      delay: 0.08 + index * STAGGER.base,
      ease: EASE_OUT_EXPO,
    },
  },
  exit: {
    y: "100%",
    opacity: 0,
    transition: {
      duration: DURATION.base,
      delay: 0.08 + index * STAGGER.base,
      ease: EASE_OUT_EXPO,
    },
  },
});

/* ── Scalar easing ───────────────────────────────────────────────
   The rAF scenes interpolate by hand, so they need the curves as plain
   functions rather than as cubic-bezier control points. */

export const clamp = (v: number, min: number, max: number): number =>
  Math.min(max, Math.max(min, v));

export const easeOutCubic = (t: number): number => 1 - Math.pow(1 - t, 3);

/** Hermite smoothstep between two edges. */
export const smoothstep = (a: number, b: number, x: number): number => {
  const t = clamp((x - a) / (b - a), 0, 1);
  return t * t * (3 - 2 * t);
};

/** Fractional part. Pairs with `sin` for deterministic pseudo-random scatter —
 *  the same letter lands in the same place on every render, unlike Math.random. */
export const fract = (n: number): number => n - Math.floor(n);
