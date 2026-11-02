/** Scroll (vh) that advances the timeline by 1.0 — the pace the scene was
 *  tuned at. Scene height is derived from this and the timeline's actual end,
 *  so the pin releases right as the last word lands (no dead scroll). */
export const PACE_VH = 600;
/** Pace multiplier on Windows (notched wheels, no momentum) — lower is faster. */
export const WINDOWS_PACE_SCALE = 0.55;
/** Pace multiplier on phones — the same scene, pinned, over less scroll. */
export const MOBILE_PACE_SCALE = 0.5;
/** Clutter pieces shrink to this on phones so the field stays a field. */
export const CLUTTER_COMPACT_SCALE = 0.68;

/** Word-lighting timeline: first word starts at W0, each next word STEP later,
 *  each takes WIN to light. Shared by the paint pass and the scene-length maths. */
export const W0 = 0.36;
export const STEP = 0.017;
export const WIN = 0.08;
/** Small beat where the finished state holds before the section releases. */
export const HOLD = 0.05;

export const MONO = "'JetBrains Mono', ui-monospace, monospace";

/** Where each clutter image sits, how big it is, and its float timing. */
export const CLUTTER = [
  { src: "/clutter/c01.webp", left: "6%", top: "8%", rot: -8, w: 96, dur: 5.4, delay: -0.2 },
  { src: "/clutter/c02.webp", left: "74%", top: "6%", rot: 10, w: 104, dur: 6, delay: -1.4 },
  { src: "/clutter/n01-notebook.webp", left: "30%", top: "12%", rot: 6, w: 96, dur: 5, delay: -2.2 },
  { src: "/clutter/c04.webp", left: "88%", top: "24%", rot: -6, w: 64, dur: 5.8, delay: -0.8 },
  { src: "/clutter/n02-hashtag.webp", left: "11%", top: "30%", rot: -5, w: 84, dur: 6.4, delay: -3 },
  { src: "/clutter/c06.webp", left: "52%", top: "18%", rot: 4, w: 78, dur: 5.2, delay: -1.9 },
  { src: "/clutter/n03-writing.webp", left: "5%", top: "60%", rot: 8, w: 100, dur: 5.6, delay: -0.5 },
  { src: "/clutter/c08.webp", left: "90%", top: "52%", rot: -10, w: 70, dur: 5.1, delay: -2.6 },
  { src: "/clutter/c09.webp", left: "82%", top: "72%", rot: 7, w: 88, dur: 6.2, delay: -1.1 },
  { src: "/clutter/c10.webp", left: "15%", top: "78%", rot: -7, w: 78, dur: 5.7, delay: -3.4 },
  { src: "/clutter/c11.webp", left: "42%", top: "84%", rot: 5, w: 92, dur: 5.3, delay: -0.9 },
  { src: "/clutter/c12.webp", left: "66%", top: "88%", rot: -9, w: 74, dur: 6.6, delay: -2 },
] as const;

export const ORB_STYLES: Record<string, string> = {
  orb1: "radial-gradient(circle at 32% 28%, #7FA8FF, #2563EB 62%, #1A44C2)",
  orb2: "radial-gradient(circle at 34% 26%, #FFE1A6, #F59E0B 60%, #C97D06)",
};
export const ORB_SHADOW: Record<string, string> = {
  orb1: "0 8px 18px rgba(37,99,235,0.4)",
  orb2: "0 8px 18px rgba(245,158,11,0.35)",
};

/** Reference height the pinned body was composed at — it scales to fit. */
export const BODY_FIT_HEIGHT = 680;
