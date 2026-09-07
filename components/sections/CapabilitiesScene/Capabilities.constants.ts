/** Accent per capability column — hex for CSS vars, rgb triplet for the glow. */
export const ACCENTS = [
  { hex: "#3B82F6", rgb: "59,130,246" },
  { hex: "#8B5CF6", rgb: "139,92,246" },
  { hex: "#14B8B0", rgb: "20,184,176" },
  { hex: "#F59E0B", rgb: "245,158,11" },
] as const;

/** Dot colours for the tool stack, cycled per item. */
export const DOT_COLORS = ["#6366F1", "#22D3EE", "#FBBF24", "#34D399"] as const;

/** The grid is a fixed 2×2 — extra groups in the copy are ignored. */
export const COLUMN_COUNT = 4;

// 7 timeline stages (type → letters → sub → lines → cards → rows → chips)
// at ~5 wheel notches each, plus the sticky 100vh.
export const SCENE_LENGTH_VH = 440;

/** Max degrees a card tilts under the cursor. */
export const TILT = 10;
/** How far a single card must have dealt in (0→1) before the lens works on it. */
export const LENS_ARM_AT = 0.98;
/** Vertical breathing room kept between the scene and the viewport edges. */
export const SCENE_PAD = 72;
/** Reference height the 1280px grid was composed at — it scales to fit. */
export const GRID_FIT_HEIGHT = 1150;

/** Lens half-extents and magnification. */
export const LENS_RX = 180;
export const LENS_RY = 60;
export const LENS_ZOOM = 2.0;

export const MONO = "'JetBrains Mono', ui-monospace, monospace";
