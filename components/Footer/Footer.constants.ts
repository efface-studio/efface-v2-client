export const MONO = "'JetBrains Mono', ui-monospace, monospace";
export const DISPLAY = "'Space Grotesk', 'Pretendard Variable', sans-serif";

/** Seconds the entrance sequence takes forward, and rewinding on the way out. */
export const SEQ_IN = 1.6;
export const SEQ_OUT = 0.45;

/** Viewport band the footer must occupy for the sequence to run forward. */
export const VISIBLE_TOP = 0.72;
export const VISIBLE_BOTTOM = 0.2;

/** Colour of the resting wordmark, and the gradient the cursor reveals. */
export const WORDMARK_DIM = "#18181E";
export const WORDMARK_GRADIENT: ReadonlyArray<readonly [number, string]> = [
  [0, "#3B82F6"],
  [0.36, "#8B5CF6"],
  [0.68, "#14B8B0"],
  [1, "#F59E0B"],
];
