/** Per-card layout + scroll-entrance constants (from the source scene). */
export const CFG = [
  { oy: 16, rot: -8, dx: -260, xr: -22 },
  { oy: -4, rot: -3.5, dx: -90, xr: 18 },
  { oy: -4, rot: 3.5, dx: 90, xr: -16 },
  { oy: 16, rot: 8, dx: 260, xr: 24 },
] as const;

/** Visual spec per card — gradients, stacking and 3D glyph parameters. */
export const CARDS = [
  {
    key: "hinest",
    gradient: "linear-gradient(160deg, #4E8CFF 0%, #2563EB 55%, #1D46C8 100%)",
    sheen: 0.16,
    zIndex: 3,
    marginLeft: 0,
    icon: { src: "/logos/hinest.svg", color: "#F6F7FA", rx: 12, ry: 22, rz: -7 },
  },
  {
    key: "muru",
    gradient: "linear-gradient(160deg, #34E0D8 0%, #14B8B0 60%, #0C9A93 100%)",
    sheen: 0.16,
    zIndex: 2,
    marginLeft: -34,
    icon: { src: "/logos/muru.svg", color: "#FFFDF8", rx: 12, ry: -22, rz: 7 },
  },
  {
    key: "qto",
    gradient: "linear-gradient(160deg, #34343C 0%, #1D1D23 60%, #141418 100%)",
    sheen: 0.1,
    zIndex: 4,
    marginLeft: -34,
    icon: { src: "/logos/qto.svg", color: "#EF6553", rx: 11, ry: 20, rz: -6 },
  },
  {
    key: "goms",
    gradient: "linear-gradient(160deg, #9D6BFF 0%, #7C3AED 55%, #6425D0 100%)",
    sheen: 0.16,
    zIndex: 3,
    marginLeft: -34,
    icon: { src: "/logos/goms.svg", color: "#FFA600", rx: 13, ry: -22, rz: 8 },
  },
] as const;

export const CARD_COUNT = CARDS.length;

/** Strength of the cursor/scroll parallax on the cards and the backing words. */
export const PARALLAX = 0.5;

/** Runway length sets the pace. Sized from the timeline: 4 stages × ~4.5 wheel
 *  notches of travel each, plus the 100vh the sticky viewport itself occupies. */
export const SCENE_LENGTH_VH = 280;

/** Reference viewport the fanned row was composed at — the row scales to fit. */
export const ROW_FIT_WIDTH = 1430;
export const ROW_FIT_HEIGHT = 780;

export const ICON_SIZE_DESKTOP = 300;
export const ICON_SIZE_MOBILE = 200;

/* ── 3D deal-in + surface lighting ──────────────────────────────────
   The row is a perspective container, so the cards are real planes in space
   rather than rotated rectangles. These values tune that space. */

/** Perspective depth on the row. Lower is a wider lens and a stronger tilt. */
export const PERSPECTIVE = 1500;

/** Max degrees a settled card yaws/pitches under the cursor. */
export const TILT_Y = 11;
export const TILT_X = 7;

/** How far back a card starts along Z before it deals forward into place. */
export const DEAL_Z = -540;

/** Degrees the card is laid back by at the start of its deal-in. */
export const DEAL_PITCH = 46;

/** Blinn-Phong exponent for the specular hotspot. Higher is a tighter glint. */
export const SHININESS = 12;

/** Pixels a hovered card rises, and how far it comes forward along Z. */
export const HOVER_LIFT = 18;
export const HOVER_Z = 60;
