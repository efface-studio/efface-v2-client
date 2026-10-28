import type { WorkFeature, WorkIcon } from "./Work.types";

/** Icon art per project `key`. Projects missing here get a monogram tile. */
export const WORK_ICONS: Record<string, WorkIcon> = {
  hinest: { src: "/work/hinest.png" },
  hwaso: { src: "/work/hwaso.png" },
  luckgluck: { src: "/work/luckgluck.png" },
  "efface-v1": { src: "/work/efface-v1.svg", bg: "#f6f6f7", inset: true },
  "efface-v2": { src: "/work/efface-v2.svg" },
  cheezefilm: { src: "/work/cheezefilm.png" },
  "2pick": { src: "/work/2pick.svg" },
  cutephoto: { src: "/work/cutephoto.png" },
  "design-system": { src: "/work/design-system.svg" },
  rooti: { src: "/work/rooti.png" },
  "rooti-admin": { src: "/work/rooti-admin.png" },
  goms: { src: "/work/goms.svg", bg: "#ffa600" },
};

/** Projects shown large above the grid, in this order. Add one when its store
 *  art is ready. */
export const WORK_FEATURED: WorkFeature[] = [
  {
    key: "hwaso",
    shots: ["/work/hwaso/shot-1.webp", "/work/hwaso/shot-2.webp", "/work/hwaso/shot-3.webp"],
  },
  {
    key: "goms",
    shots: ["/work/goms/shot-1.webp", "/work/goms/shot-2.webp"],
  },
  {
    key: "hinest",
    shots: Array.from({ length: 7 }, (_, i) => `/work/hinest/shot-${i + 1}.webp`),
  },
  {
    key: "rooti",
    shots: ["/work/rooti/shot-1.webp", "/work/rooti/shot-2.webp", "/work/rooti/shot-3.webp"],
  },
  {
    key: "rooti-admin",
    shots: [
      "/work/rooti-admin/shot-1.webp",
      "/work/rooti-admin/shot-2.webp",
      "/work/rooti-admin/shot-3.webp",
    ],
  },
];

/* ── Pinned featured scene ───────────────────────────────────────────
   The runway is measured in units: each screenshot takes one unit to slide
   in, and each project gets HOLD more to sit still before handing over. */

/** Units a project rests after its last shot lands, before the next one. */
export const FEATURED_HOLD = 1;

/** Units over which one project fades out and the next fades in. */
export const FEATURED_FADE = 0.5;

/** Scroll length (vh) per unit — sets the pace. */
export const FEATURED_PACE_VH = 24;

/** How far (px) a shot travels in from the right. */
export const FEATURED_SLIDE = 520;

/** Shots visible at once; past this the track slides left. */
export const FEATURED_VISIBLE = 3;
