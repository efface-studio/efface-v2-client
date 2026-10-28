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
];
